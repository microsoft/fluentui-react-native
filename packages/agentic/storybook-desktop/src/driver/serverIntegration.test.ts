import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createServer, Socket } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { NodeDesktopCommandRunner } from '@fluentui-react-native/desktop-test/commands';
import { deadline } from '@fluentui-react-native/desktop-test/commands';
import { DesktopRunReporter, startReportTransport } from '@fluentui-react-native/desktop-test/reporting';

import type { StoredDriverManifest } from './generatedManifest.js';

jest.setTimeout(30_000);

describe('desktop Storybook server integration', () => {
  test.each(['helper-path-and-hash', 'unknown-field', 'helper-bytes'])(
    'the actual channel process rejects %s before spawning a helper or listening',
    async (tamper) => {
      const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
      const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'storybook-spawn-trust-'));
      const manifestPath = path.join(root, 'driver-manifest.json');
      const marker = path.join(root, 'unexpected-spawn');
      const fixture = createIntegrationManifest(root, storybookPort, driverPort);
      const hash = (contents: string) => createHash('sha256').update(contents).digest('hex');
      const originalHelper = '#!/usr/bin/env node\nprocess.exit(0);\n';
      const untrustedHelper = "#!/usr/bin/env node\nrequire('node:fs').writeFileSync(process.env.FURN_TEST_SPAWN_MARKER, 'spawned');\n";
      fs.writeFileSync(fixture.nativeDriver.executablePath, originalHelper, { mode: 0o700 });
      fixture.nativeDriver.artifactId = hash(originalHelper);
      const originalContents = JSON.stringify(fixture);
      const handoff = {
        credentialsDigest: 'unused-before-rejection',
        manifestDigest: hash(originalContents),
        nativeDriver: { ...fixture.nativeDriver },
        runtimeModuleDigest: 'unused-before-rejection',
        runtimeModulePath: path.join(fixture.credentials.root, fixture.credentials.runtimeModule),
        schemaVersion: 1,
      };
      if (tamper === 'helper-path-and-hash') {
        fixture.nativeDriver.executablePath = path.join(root, 'substituted-helper');
        fixture.nativeDriver.artifactId = hash(untrustedHelper);
        fs.writeFileSync(fixture.nativeDriver.executablePath, untrustedHelper, { mode: 0o700 });
      } else if (tamper === 'helper-bytes') {
        fs.writeFileSync(fixture.nativeDriver.executablePath, untrustedHelper);
      }
      fs.writeFileSync(manifestPath, JSON.stringify(tamper === 'unknown-field' ? { ...fixture, unexpected: true } : fixture));
      const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
      const child = spawn(process.execPath, [path.resolve(__dirname, '../../config/server-runner.cjs')], {
        cwd: projectRoot,
        env: {
          ...process.env,
          FURN_TEST_SPAWN_MARKER: marker,
          STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
          STORYBOOK_DRIVER_MANIFEST: manifestPath,
          STORYBOOK_DRIVER_HANDOFF: JSON.stringify(handoff),
          STORYBOOK_NATIVE_DRIVER_FAKE: '0',
          STORYBOOK_PROJECT_ROOT: projectRoot,
          STORYBOOK_WS_PORT: String(storybookPort),
        },
        signal: AbortSignal.timeout(20_000),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const output: string[] = [];
      child.stdout.on('data', (data: Buffer) => output.push(data.toString()));
      child.stderr.on('data', (data: Buffer) => output.push(data.toString()));
      try {
        const code = await new Promise<number | null>((resolve, reject) => {
          child.once('error', reject);
          child.once('close', resolve);
        });
        expect(code).toBe(1);
        expect(output.join('')).toMatch(/trusted parent handoff|driver manifest|hash does not match/);
        expect(fs.existsSync(marker)).toBe(false);
        await expect(fetch(loopbackUrl(driverPort, '/status'))).rejects.toThrow();
      } finally {
        if (child.exitCode === null) child.kill();
        fs.rmSync(root, { force: true, recursive: true });
      }
    },
  );

  test('hosts the Storybook channel and Stage 1 smoke-test target in one process', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    const driverManifest = createIntegrationManifest(temporaryDirectory, storybookPort, driverPort);
    fs.writeFileSync(manifestPath, JSON.stringify(driverManifest));

    const output: string[] = [];
    const sink = {
      write: (text: string) => {
        output.push(text);
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot: temporaryDirectory,
      kind: 'lifecycle',
      reporterMode: 'plain',
      output: sink,
      errorOutput: sink,
      summary: false,
    });
    const transport = await startReportTransport(reporter);
    const runner = new NodeDesktopCommandRunner({ reporter, environment: transport.environment });
    const child = runner.start({
      command: process.execPath,
      args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
      cwd: projectRoot,
      env: {
        STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
        STORYBOOK_DRIVER_MANIFEST: manifestPath,
        STORYBOOK_NATIVE_DRIVER_FAKE: '1',
        STORYBOOK_PROJECT_ROOT: projectRoot,
        STORYBOOK_SMOKE_MODE: 'stories-and-tests',
        STORYBOOK_WS_PORT: String(storybookPort),
      },
    });

    try {
      await expect(child.waitForReadiness!({ tier: 'service-ready', service: 'storybook-channel' }, 20_000)).resolves.toEqual({
        tier: 'service-ready',
        service: 'storybook-channel',
        incarnation: expect.any(String),
        processId: expect.any(Number),
      });
      const [indexResponse, driverResponse] = await Promise.all([
        waitForResponse(loopbackUrl(storybookPort, '/index.json')),
        waitForResponse(loopbackUrl(driverPort, '/status')),
      ]);
      const index = (await indexResponse.json()) as { entries?: Record<string, unknown> };
      const driver = (await driverResponse.json()) as { value?: { ready?: boolean; targets?: { id?: string }[] } };

      expect(Object.keys(index.entries ?? {}).length).toBeGreaterThan(0);
      expect(driver.value).toMatchObject({
        ready: true,
        targets: [{ id: 'integration-windows' }],
      });

      const client = createDesktopDriverClient({ url: loopbackUrl(driverPort, '') });
      const session = await client.newSession({
        alwaysMatch: {
          platformName: 'windows',
          'furn:target': 'integration-windows',
          'furn:launchMode': 'attach',
        },
      });
      await expect(session.selectStory('components-button--default', 'integration-run')).resolves.toEqual({
        diagnostics: {
          application: { processId: 1000, processStartedAt: '1970-01-01T00:00:00.000Z' },
          nativeMarkerPolls: 1,
          nativeVerificationMs: expect.any(Number),
        },
        previewGeneration: 1,
        runId: 'integration-run',
        storyId: 'components-button--default',
      });
      await session.delete();
    } finally {
      try {
        await child.stop();
        expect(await child.completed).toBe(0);
        await runner.close();
        await transport.close();
        expect((await reporter.finish()).status).toBe('passed');
      } finally {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
      }
    }

    expect(output.join('')).toContain('WebDriver ');
  });

  test.each([
    ['accessible', { keyboard: false, physicalClick: false, wheel: false }],
    ['physical', { keyboard: true, physicalClick: true, wheel: true }],
  ] as const)('starts a driver for the %s input lane with matching physical input features', async (input, expected) => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ ...createIntegrationManifest(temporaryDirectory, storybookPort, driverPort), wdio: { input } }),
    );
    const sink = { write: () => true };
    const reporter = new DesktopRunReporter({
      artifactsRoot: temporaryDirectory,
      kind: 'lifecycle',
      reporterMode: 'plain',
      output: sink,
      errorOutput: sink,
      summary: false,
    });
    const transport = await startReportTransport(reporter);
    const runner = new NodeDesktopCommandRunner({ reporter, environment: transport.environment });
    const child = runner.start({
      command: process.execPath,
      args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
      cwd: projectRoot,
      env: {
        STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
        STORYBOOK_DRIVER_MANIFEST: manifestPath,
        STORYBOOK_NATIVE_DRIVER_FAKE: '1',
        STORYBOOK_PROJECT_ROOT: projectRoot,
        STORYBOOK_SMOKE_MODE: 'stories-and-tests',
        STORYBOOK_WS_PORT: String(storybookPort),
      },
    });

    try {
      await waitForResponse(loopbackUrl(driverPort, '/status'));
      const client = createDesktopDriverClient({ url: loopbackUrl(driverPort, '') });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': 'integration-windows', 'furn:launchMode': 'attach' },
      });
      // The accessible lane trusts this report, so the driver itself must show physical input disabled.
      expect(session.capabilities['furn:features']).toMatchObject(expected);
      await session.delete();
    } finally {
      try {
        await child.stop();
        await child.completed;
        await runner.close();
        await transport.close();
        await reporter.finish();
      } finally {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
      }
    }
  });

  test('closes lingering upstream HTTP connections when the legacy channel stops', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    fs.writeFileSync(manifestPath, JSON.stringify(createIntegrationManifest(temporaryDirectory, storybookPort, driverPort)));
    const sink = { write: () => true };
    const reporter = new DesktopRunReporter({
      artifactsRoot: temporaryDirectory,
      kind: 'lifecycle',
      reporterMode: 'plain',
      output: sink,
      errorOutput: sink,
      summary: false,
    });
    const transport = await startReportTransport(reporter);
    const runner = new NodeDesktopCommandRunner({ reporter, environment: transport.environment });
    const child = runner.start({
      command: process.execPath,
      args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
      cwd: projectRoot,
      env: {
        STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
        STORYBOOK_DRIVER_MANIFEST: manifestPath,
        STORYBOOK_NATIVE_DRIVER_FAKE: '1',
        STORYBOOK_PROJECT_ROOT: projectRoot,
        STORYBOOK_WS_PORT: String(storybookPort),
      },
    });
    const idle = new Socket();
    try {
      await child.waitForReadiness!({ tier: 'service-ready', service: 'storybook-channel' }, 20_000);
      // An accepted connection that never sends a request stays referenced until the listener closes it.
      await new Promise<void>((resolve, reject) => {
        idle.once('error', reject);
        idle.connect(storybookPort, '127.0.0.1', resolve);
      });
      const closed = new Promise<void>((resolve) => idle.once('close', () => resolve()));
      const started = Date.now();
      await child.stop();
      expect(await child.completed).toBe(0);
      expect(Date.now() - started).toBeLessThan(8_000);
      await closed;
    } finally {
      try {
        idle.destroy();
        await child.stop();
        await runner.close();
        await transport.close();
        expect((await reporter.finish()).status).toBe('passed');
      } finally {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
      }
    }
  });

  // An owned channel is disposed by its parent; a standalone one must still clean up on a terminal hangup.
  (process.platform === 'win32' ? test.skip : test)('closes a standalone channel cleanly on SIGHUP', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    fs.writeFileSync(manifestPath, JSON.stringify(createIntegrationManifest(temporaryDirectory, storybookPort, driverPort)));
    const output: string[] = [];
    const sink = {
      write: (text: string) => {
        output.push(text);
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot: temporaryDirectory,
      kind: 'lifecycle',
      reporterMode: 'plain',
      output: sink,
      errorOutput: sink,
      summary: false,
    });
    const transport = await startReportTransport(reporter);
    const child = spawn(process.execPath, [path.resolve(__dirname, '../../config/server-runner.cjs')], {
      cwd: projectRoot,
      env: {
        ...process.env,
        ...transport.environment,
        STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
        STORYBOOK_DRIVER_MANIFEST: manifestPath,
        STORYBOOK_NATIVE_DRIVER_FAKE: '1',
        STORYBOOK_PROJECT_ROOT: projectRoot,
        STORYBOOK_WS_PORT: String(storybookPort),
      },
      stdio: 'ignore',
    });
    const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
      child.once('exit', (code, signal) => resolve({ code, signal })),
    );
    try {
      await deadline(
        (async () => {
          while (!output.join('').includes('READY Storybook')) await new Promise((resolve) => setTimeout(resolve, 50));
        })(),
        20_000,
        'Waiting for the standalone channel',
      );
      child.kill('SIGHUP');
      expect(await exited).toEqual({ code: 0, signal: null });
    } finally {
      try {
        if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
        await transport.close();
        expect((await reporter.finish()).status).toBe('passed');
      } finally {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
      }
    }
  });

  test('refuses an agent connection from the fake driver', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const readyPath = path.join(temporaryDirectory, 'agent-ready.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        ...createIntegrationManifest(temporaryDirectory, storybookPort, driverPort),
        agent: { descriptor: 'agent.json', readyPath },
      }),
    );
    const output: string[] = [];
    const sink = {
      write: (text: string) => {
        output.push(text);
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot: temporaryDirectory,
      kind: 'lifecycle',
      reporterMode: 'plain',
      output: sink,
      errorOutput: sink,
      summary: false,
    });
    const transport = await startReportTransport(reporter);
    const runner = new NodeDesktopCommandRunner({ reporter, environment: transport.environment });
    try {
      const child = runner.start({
        command: process.execPath,
        args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
        cwd: projectRoot,
        env: {
          STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
          STORYBOOK_DRIVER_MANIFEST: manifestPath,
          STORYBOOK_NATIVE_DRIVER_FAKE: '1',
          STORYBOOK_PROJECT_ROOT: projectRoot,
          STORYBOOK_WS_PORT: String(storybookPort),
        },
      });
      expect(await child.completed).not.toBe(0);
      expect(fs.existsSync(readyPath)).toBe(false);
      await runner.close();
      await transport.close();
      await reporter.finish();
      expect(output.join('')).toContain('An agent connection requires the native Desktop Driver');
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

function createIntegrationManifest(temporaryDirectory: string, storybookPort: number, driverPort: number): StoredDriverManifest {
  return {
    application: {
      leasePath: path.join(temporaryDirectory, '.private', 'application-lease.windows.json'),
      windowTitle: 'Agentic Components Storybook',
    },
    appName: 'AgenticStorybook',
    credentials: {
      root: path.join(temporaryDirectory, '.private'),
      name: 'credentials-fixture.json',
      runtimeModule: 'runtime-fixture.js',
    },
    displayName: 'Agentic Components Storybook',
    driverPort,
    endpoint: 'windows',
    instanceId: 'integration',
    metroPort: 8081,
    nativeDriver: {
      architecture: 'x64',
      artifactId: 'artifact',
      artifactRoot: temporaryDirectory,
      buildFingerprint: 'build',
      buildId: 'build-id',
      compatibilityKey: 'compatibility',
      configuration: 'release',
      endpoints: ['windows', 'win32'],
      executablePath: path.join(temporaryDirectory, 'driver.exe'),
      features: ['probe'],
      origin: 'cache',
      provider: 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'source',
      wireProtocol: { major: 1, minor: 0 },
    },
    platformManifestDigest: 'platform-digest',
    portablePlanDigest: 'portable-digest',
    renderer: 'fabric',
    schemaVersion: 3,
    storyManifest: {
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/button/button.stories.tsx',
          tags: ['desktop-e2e'],
          title: 'Components/Button',
        },
      ],
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      schemaVersion: 1,
    },
    storybookPort,
    targetId: 'integration-windows',
    testIDPrefix: 'integration-storybook',
  };
}

describe('PowerShell owned service integration', () => {
  const windowsTest = process.platform === 'win32' ? test : test.skip;
  windowsTest.each([
    { verbose: true, failService: false },
    { verbose: true, failService: true },
    { verbose: false, failService: false },
    { verbose: false, failService: true },
  ])(
    'streams grandchild diagnostics live only with verbose, keeps them in the log, and drains services (%j)',
    async ({ verbose, failService }) => {
      const port = await getAvailablePort();
      const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-powershell-services-'));
      const output: string[] = [];
      const sink = {
        write: (text: string) => {
          output.push(text);
          return true;
        },
      };
      const reporter = new DesktopRunReporter({
        artifactsRoot: temporaryDirectory,
        kind: 'lifecycle',
        reporterMode: 'plain',
        output: sink,
        errorOutput: sink,
        summary: false,
        verbose,
      });
      const transport = await startReportTransport(reporter);
      const runner = new NodeDesktopCommandRunner({ reporter, environment: transport.environment });
      const quote = (text: string) => `'${text.replaceAll("'", "''")}'`;
      const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
      const script = path.join(temporaryDirectory, 'fixture with spaces.ps1');
      const marker = path.join(temporaryDirectory, 'service-pid.json');
      const source = `
      require('node:fs').writeFileSync(${JSON.stringify(marker)}, JSON.stringify(process.pid));
      const server = require('node:net').createServer(socket => socket.end());
      setTimeout(() => server.listen(${port}, '127.0.0.1', () => {
        process.stderr.write('live PowerShell grandchild diagnostic\\n');
        ${failService ? "setTimeout(() => { process.stderr.write('original nested service failure\\n'); process.exit(7); }, 700);" : ''}
      }), 500);`;
      fs.writeFileSync(
        script,
        `
      $ErrorActionPreference = 'Stop'
      $projectRoot = ${quote(projectRoot)}
      . ${quote(path.resolve(__dirname, '../../config/owned-services.ps1'))}
      try {
        $service = Start-OwnedCommand -FilePath ${quote(process.execPath)} -ArgumentList @('-e', ${quote(source)}) -LogName 'contract-service'
        Wait-ForTcpPort -Port ${port} -TimeoutSeconds 10
        for ($index = 0; $index -lt 20; $index += 1) { Assert-OwnedServices; Start-Sleep -Milliseconds 100 }
      } finally { Stop-OwnedServices }
    `,
      );
      let completed = false;
      const running = runner.start({
        command: 'pwsh',
        args: ['-NoProfile', '-NonInteractive', '-File', script],
        cwd: projectRoot,
        env: {},
        label: 'PowerShell fixture',
      });
      void running.completed.then(() => {
        completed = true;
      });
      try {
        if (verbose) {
          await deadline(
            (async () => {
              while (!output.join('').includes('live PowerShell grandchild diagnostic')) {
                if (completed) throw new Error(output.join(''));
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            })(),
            15_000,
            'PowerShell diagnostic',
          );
          expect(completed).toBe(false);
        }
        expect(await running.completed).toBe(failService ? 1 : 0);
      } finally {
        try {
          await running.stop();
          await runner.close();
          await transport.close();
          const result = await reporter.finish();
          expect(result.status).toBe(failService ? 'failed' : 'passed');
          const text = output.join('');
          if (failService) expect(text).toContain('original nested service failure');
          // Without verbose the diagnostic stays in the log, so only a failed command shows it.
          expect(text.includes('live PowerShell grandchild diagnostic')).toBe(verbose || failService);
          const pid: number = JSON.parse(fs.readFileSync(marker, 'utf8'));
          expect(() => process.kill(pid, 0)).toThrow();
        } finally {
          fs.rmSync(temporaryDirectory, { recursive: true, force: true });
        }
      }
    },
    45_000,
  );
});

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Could not allocate a loopback port.'));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForResponse(url: string): Promise<Response> {
  const deadline = Date.now() + 20_000;
  let lastError: unknown;
  do {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      lastError = new Error(`${url} returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for ${url}: ${(lastError as Error)?.message ?? 'not ready'}`);
}

function loopbackUrl(port: number, pathname: string): string {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
  return `http://127.0.0.1:${port}${pathname}`;
}

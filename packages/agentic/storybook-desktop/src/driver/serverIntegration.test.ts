import fs from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { NodeDesktopCommandRunner } from '@fluentui-react-native/desktop-test/commands';
import { deadline } from '@fluentui-react-native/desktop-test/commands';
import { DesktopRunReporter, startReportTransport } from '@fluentui-react-native/desktop-test/reporting';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';

jest.setTimeout(30_000);

describe('desktop Storybook server integration', () => {
  test('hosts the Storybook channel and Stage 1 smoke-test target in one process', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    const driverManifest: DesktopStorybookDriverManifest = {
      application: {
        leaseNonce: 'integration-nonce',
        leasePath: path.join(temporaryDirectory, 'application-lease.json'),
        windowTitle: 'Agentic Components Storybook',
      },
      appName: 'AgenticStorybook',
      bridgeNonce: 'integration-nonce',
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
      schemaVersion: 2,
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
});

describe('PowerShell owned service integration', () => {
  const windowsTest = process.platform === 'win32' ? test : test.skip;
  windowsTest.each([false, true])(
    'forwards live grandchild diagnostics and drains services (failure=%s)',
    async (failService) => {
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
        output: sink,
        errorOutput: sink,
        summary: false,
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
        expect(await running.completed).toBe(failService ? 1 : 0);
      } finally {
        try {
          await running.stop();
          await runner.close();
          await transport.close();
          const result = await reporter.finish();
          expect(result.status).toBe(failService ? 'failed' : 'passed');
          if (failService) expect(output.join('')).toContain('original nested service failure');
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

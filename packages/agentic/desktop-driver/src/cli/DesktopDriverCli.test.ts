import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import type { NativeDriverArtifact } from '../native/types';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverCommand } from './createDesktopDriverCommand';

jest.setTimeout(30_000);

describe('desktop-driver CLI', () => {
  test('exposes isolated native build and resolution commands', async () => {
    const artifact = createNativeArtifact();
    const buildDriver = jest.fn(async () => artifact);
    const resolveDriver = jest.fn(async () => ({ ...artifact, origin: 'cache' as const }));
    const output: string[] = [];
    const createProgram = () =>
      createDesktopDriverCommand({
        buildDriver,
        resolveDriver,
        stdout: {
          write(value) {
            output.push(String(value));
            return true;
          },
        },
      });

    await createProgram().parseAsync([
      'node',
      'test',
      'build-driver',
      '--platform',
      'macos',
      '--configuration',
      'release',
      '--cache-root',
      'native-cache',
      '--macos-signing-identity',
      'Apple Development: Example',
    ]);
    await createProgram().parseAsync([
      'node',
      'test',
      'resolve-driver',
      '--platform',
      'win32',
      '--build-policy',
      'never',
      '--helper-path',
      'driver.exe',
    ]);

    expect(buildDriver).toHaveBeenCalledWith({
      architecture: undefined,
      cacheRoot: 'native-cache',
      configuration: 'release',
      force: undefined,
      macosSigningIdentity: 'Apple Development: Example',
      platform: 'macos',
    });
    expect(resolveDriver).toHaveBeenCalledWith({
      architecture: undefined,
      buildPolicy: 'never',
      cacheRoot: undefined,
      configuration: 'release',
      force: undefined,
      helperPath: 'driver.exe',
      installRoot: undefined,
      macosSigningIdentity: undefined,
      platform: 'win32',
    });
    expect(JSON.parse(output[0])).toMatchObject({ artifactId: 'artifact-id', origin: 'built' });
    expect(JSON.parse(output[1])).toMatchObject({ artifactId: 'artifact-id', origin: 'cache' });
  });

  test('serves, lists, runs, and describes a fake authored plan as JSON', async () => {
    const port = await getAvailablePort();
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-cli-'));
    const artifactsRoot = path.join(temporaryDirectory, 'artifacts');
    const manifestPath = path.join(temporaryDirectory, 'manifest.json');
    const manifest: DesktopStoryManifest = {
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/button/button.stories.tsx',
          tags: ['e2e', 'story'],
          tests: {
            version: 1,
            tests: [
              {
                id: 'cli-plan',
                steps: [{ expect: { state: 'enabled', target: { testId: 'button-primary' }, value: true } }],
              },
            ],
          },
          title: 'Components/Button',
        },
      ],
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      schemaVersion: 1,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const server = spawnCli(['serve', '--port', String(port), '--target', 'cli-target', '--manifest', manifestPath]);
    try {
      await waitForResponse(loopbackUrl(port, '/status'));
      const url = loopbackUrl(port, '');
      const stories = await runCli(['stories', 'list', '--url', url, '--target', 'cli-target']);
      expect(stories).toMatchObject({ entries: [{ id: 'components-button--default' }] });

      const result = await runCli([
        'stories',
        'run',
        '--url',
        url,
        '--target',
        'cli-target',
        '--artifacts',
        artifactsRoot,
        '--test',
        'cli-plan',
      ]);
      expect(result).toMatchObject({ status: 'passed', tests: [{ testId: 'cli-plan' }] });

      const tree = await runCli([
        'agent',
        'describe',
        '--url',
        url,
        '--target',
        'cli-target',
        '--artifacts',
        artifactsRoot,
        '--scope',
        'story',
      ]);
      expect(tree).toMatchObject([{ testId: 'story-root' }]);
    } finally {
      server.kill();
      await waitForExit(server);
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  function createNativeArtifact(): NativeDriverArtifact {
    return {
      architecture: 'x64',
      artifactId: 'artifact-id',
      artifactRoot: 'artifact-root',
      buildFingerprint: 'build-fingerprint',
      buildId: 'build-id',
      compatibilityKey: 'compatibility-key',
      configuration: 'release',
      endpoints: ['windows', 'win32'],
      executablePath: 'driver.exe',
      features: ['probe'],
      origin: 'built',
      provider: 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'source-digest',
      wireProtocol: { major: 1, minor: 0 },
    };
  }
});

function spawnCli(args: readonly string[]) {
  return spawn(process.execPath, [path.resolve(__dirname, '../../config/cli.cjs'), ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runCli(args: readonly string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawnCli(args);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `Desktop Driver CLI exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}

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

async function waitForResponse(url: string): Promise<void> {
  const deadline = Date.now() + 20_000;
  do {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the bounded startup deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for ${url}.`);
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => child.once('exit', () => resolve()));
}

function loopbackUrl(port: number, pathname: string): string {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
  return `http://127.0.0.1:${port}${pathname}`;
}

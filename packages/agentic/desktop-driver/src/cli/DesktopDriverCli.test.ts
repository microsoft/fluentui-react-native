import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { NativeDriverError } from '../native/NativeDriverError';
import type { NativeDriverArtifact } from '../native/types';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverCommand, runDesktopDriverCli } from './createDesktopDriverCommand';

jest.setTimeout(30_000);

describe('desktop-driver CLI', () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

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

  test('supports compact JSON and NDJSON result modes without changing the default output', async () => {
    const artifact = createNativeArtifact();
    const output: string[] = [];
    const createProgram = () =>
      createDesktopDriverCommand({
        buildDriver: jest.fn(async () => artifact),
        stdout: {
          write(value) {
            output.push(String(value));
            return true;
          },
        },
      });

    await createProgram().parseAsync(['node', 'test', 'build-driver', '--platform', 'macos', '--reporter', 'json']);
    await createProgram().parseAsync(['node', 'test', 'build-driver', '--platform', 'macos', '--json']);
    await createProgram().parseAsync(['node', 'test', 'build-driver', '--platform', 'macos', '--reporter', 'ndjson']);

    expect(output[0]).toBe(`${JSON.stringify(artifact)}\n`);
    expect(output[1]).toBe(output[0]);
    expect(JSON.parse(output[2])).toEqual({ schemaVersion: 1, type: 'terminal', result: artifact });
  });

  test('writes structured usage errors before failing command parsing', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-cli-error-'));
    try {
      const response = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
        const child = spawn(process.execPath, [path.resolve(__dirname, '../../config/cli.cjs'), '--reporter', 'json', 'unknown'], {
          cwd: root,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
        child.once('error', reject);
        child.once('close', (code) =>
          resolve({ code, stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') }),
        );
      });

      expect(response.code).toBe(1);
      expect(response.stderr).toBe('');
      expect(JSON.parse(response.stdout)).toMatchObject({
        schemaVersion: 1,
        type: 'error',
        error: { code: 'usage' },
      });
    } finally {
      fs.rmSync(root, { force: true, recursive: true });
    }
  });

  test('reports subcommand usage errors on stderr in plain mode', async () => {
    const result = await runInProcessCli(['stories', 'list']);

    expect(result.stdout).toBe('');
    expect(result.stderr).toContain("required option '--url <url>' not specified");
    expect(result.exitCode).toBe(1);
  });

  test('reports subcommand usage errors as one structured record in JSON and NDJSON modes', async () => {
    const json = await runInProcessCli(['--reporter', 'json', 'stories', 'list']);
    const ndjson = await runInProcessCli(['--reporter', 'ndjson', 'stories', 'list']);

    for (const result of [json, ndjson]) {
      expect(result.stderr).toBe('');
      expect(result.exitCode).toBe(1);
      expect(JSON.parse(result.stdout)).toMatchObject({
        schemaVersion: 1,
        type: 'error',
        error: { code: 'usage', message: expect.stringContaining("required option '--url <url>' not specified") },
      });
    }
    expect(ndjson.stdout).toBe(json.stdout);
  });

  test('reports bad choices and invalid option values as usage errors', async () => {
    const choice = await runInProcessCli([
      '--reporter',
      'ndjson',
      'stories',
      'list',
      '--platform',
      'linux',
      '--url',
      'https://127.0.0.1:1',
      '--target',
      'target',
    ]);
    const port = await runInProcessCli(['--reporter', 'json', 'serve', '--port', 'abc']);

    expect(JSON.parse(choice.stdout)).toMatchObject({
      type: 'error',
      error: { code: 'usage', message: expect.stringContaining('Allowed choices are macos, windows') },
    });
    expect(JSON.parse(port.stdout)).toMatchObject({
      type: 'error',
      error: { code: 'usage', message: expect.stringContaining('Port must be an integer between 0 and 65535') },
    });
  });

  test('does not start serve when DESKTOP_REPORTER is invalid', async () => {
    const result = await runInProcessCli(['serve', '--port', '0'], 'xml');

    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('Reporter must be one of auto, plain, github-actions, json, ndjson. Received "xml".');
    expect(result.exitCode).toBe(1);
  });

  test('clips long doctor failure messages', async () => {
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      resolveDriver: jest.fn(async () => {
        throw new Error('native helper failure '.repeat(200));
      }),
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'macos']);

    const message = JSON.parse(output.join('')).error.message as string;
    expect(Buffer.byteLength(message)).toBeLessThanOrEqual(1024);
    expect(message.endsWith('…')).toBe(true);
  });

  test('does not crash when the consumer closes stdout before a structured error is written', async () => {
    const response = await new Promise<{ code: number | null; stderr: string }>((resolve, reject) => {
      const child = spawnCli(['--reporter', 'json', 'unknown']);
      const stderr: Buffer[] = [];
      child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
      child.stdout.destroy();
      child.once('error', reject);
      child.once('close', (code) => resolve({ code, stderr: Buffer.concat(stderr).toString('utf8') }));
    });

    expect(response.stderr).toBe('');
    expect(response.code).toBe(1);
  });

  test('runs noninteractive permission diagnostics through the resolved macOS helper', async () => {
    const artifact = createNativeArtifact({
      architecture: 'arm64',
      endpoints: ['macos'],
      executablePath: '/verified/FurnDesktopDriverHost.app/Contents/MacOS/furn-desktop-driver-host',
      provider: 'macos',
      signing: { mode: 'adhoc' },
    });
    const resolveDriver = jest.fn(async () => artifact);
    const permissionProbe = jest.fn(async () => ({
      permissions: {
        accessibility: { preflight: false },
        postEvent: { preflight: true },
        screenCapture: { preflight: false },
      },
      promptRequested: false,
      schemaVersion: 1,
      type: 'permissions',
    }));
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      permissionProbe,
      resolveDriver,
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'macos', '--permissions']);

    expect(resolveDriver).toHaveBeenCalledWith({
      architecture: undefined,
      buildPolicy: 'never',
      cacheRoot: undefined,
      configuration: 'release',
      force: undefined,
      helperPath: undefined,
      installRoot: undefined,
      macosSigningIdentity: undefined,
      platform: 'macos',
    });
    expect(permissionProbe).toHaveBeenCalledWith(artifact, { prompt: false });
    expect(JSON.parse(output.join(''))).toMatchObject({
      permissions: {
        promptRequested: false,
        schemaVersion: 1,
        type: 'permissions',
      },
      ready: true,
      result: { executablePath: artifact.executablePath },
    });
  });

  test('passes the explicit doctor prompt flag only to macOS permission diagnostics', async () => {
    const artifact = createNativeArtifact({
      architecture: 'arm64',
      endpoints: ['macos'],
      provider: 'macos',
      signing: { mode: 'signed' },
    });
    const permissionProbe = jest.fn(async () => ({
      promptRequested: true,
      schemaVersion: 1,
      type: 'permissions',
    }));
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      permissionProbe,
      resolveDriver: jest.fn(async () => artifact),
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'macos', '--permissions', '--prompt']);

    expect(permissionProbe).toHaveBeenCalledWith(artifact, { prompt: true });
    expect(JSON.parse(output.join(''))).toMatchObject({
      permissions: { promptRequested: true },
      ready: true,
    });
  });

  test('rejects prompt mode without permissions before resolving a helper', async () => {
    const resolveDriver = jest.fn(async () => createNativeArtifact());
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      resolveDriver,
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'macos', '--prompt']);

    expect(resolveDriver).not.toHaveBeenCalled();
    expect(JSON.parse(output.join(''))).toEqual({
      error: {
        code: 'invalid-params',
        message: '--prompt requires --permissions.',
      },
      ready: false,
    });
  });

  test('preserves Windows doctor behavior by rejecting macOS-only permission diagnostics', async () => {
    const resolveDriver = jest.fn(async () => createNativeArtifact());
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      resolveDriver,
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'windows', '--permissions']);

    expect(resolveDriver).not.toHaveBeenCalled();
    expect(JSON.parse(output.join(''))).toMatchObject({
      error: { code: 'unsupported-operation' },
      ready: false,
    });
  });

  test('runs Win32 doctor with prebuilt-only resolution and reports cache misses', async () => {
    const resolveDriver = jest.fn(async () => {
      throw new NativeDriverError('no-verified-prebuilt', 'No verified Win32 helper is available.');
    });
    const output: string[] = [];
    const program = createDesktopDriverCommand({
      resolveDriver,
      stdout: {
        write(value) {
          output.push(String(value));
          return true;
        },
      },
    });

    await program.parseAsync(['node', 'test', 'doctor', '--platform', 'win32', '--cache-root', 'native-cache']);

    expect(resolveDriver).toHaveBeenCalledWith({
      architecture: undefined,
      buildPolicy: 'never',
      cacheRoot: 'native-cache',
      configuration: 'release',
      force: undefined,
      helperPath: undefined,
      installRoot: undefined,
      macosSigningIdentity: undefined,
      platform: 'win32',
    });
    expect(JSON.parse(output.join(''))).toEqual({
      error: {
        code: 'no-verified-prebuilt',
        message: 'No verified Win32 helper is available.',
      },
      ready: false,
    });
    expect(process.exitCode).toBe(1);
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

  function createNativeArtifact(overrides: Partial<NativeDriverArtifact> = {}): NativeDriverArtifact {
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
      ...overrides,
    };
  }
});

async function runInProcessCli(argv: readonly string[], reporterEnvironment?: string) {
  const previousReporter = process.env.DESKTOP_REPORTER;
  const stdout: string[] = [];
  const stderr: string[] = [];
  const writeOut = jest.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
    stdout.push(String(chunk));
    return true;
  });
  const writeErr = jest.spyOn(process.stderr, 'write').mockImplementation((chunk: string | Uint8Array) => {
    stderr.push(String(chunk));
    return true;
  });
  try {
    if (reporterEnvironment === undefined) delete process.env.DESKTOP_REPORTER;
    else process.env.DESKTOP_REPORTER = reporterEnvironment;
    process.exitCode = undefined;
    await runDesktopDriverCli(['node', 'desktop-driver', ...argv]);
    return { stdout: stdout.join(''), stderr: stderr.join(''), exitCode: process.exitCode };
  } finally {
    writeOut.mockRestore();
    writeErr.mockRestore();
    if (previousReporter === undefined) delete process.env.DESKTOP_REPORTER;
    else process.env.DESKTOP_REPORTER = previousReporter;
  }
}

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

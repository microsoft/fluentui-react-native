import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { defaultNativeDriverCacheRoot } from './filesystem';
import type { MacOSToolchain } from './macos/buildMacOSDriver';
import { buildMacOSDriver, probeMacOSToolchain, verifyMacOSDriver } from './macos/buildMacOSDriver';
import { buildNativeDesktopDriver, resolveNativeDesktopDriver } from './nativeDriver';
import { NativeDriverError } from './NativeDriverError';

// The cache and publication logic is host-independent, so these tests drive it with a stand-in macOS toolchain and a
// small executable that answers the handshake. The real toolchain is covered by the gated native tests.
jest.mock('./macos/buildMacOSDriver', () => ({
  ...jest.requireActual('./macos/buildMacOSDriver'),
  buildMacOSDriver: jest.fn(),
  hashMacOSDriverSources: jest.fn(() => 'fixed-source-digest'),
  probeMacOSToolchain: jest.fn(),
  verifyMacOSDriver: jest.fn(),
}));

jest.mock('./boundedCommand', () => {
  const actual = jest.requireActual<typeof import('./boundedCommand')>('./boundedCommand');
  const { basename } = jest.requireActual<typeof import('node:path')>('node:path');
  return {
    ...actual,
    runBoundedCommand: (...[executable, args, options]: Parameters<typeof actual.runBoundedCommand>) => {
      // Windows cannot execute the test fixture's POSIX shebang; invoke only this fixture through Node directly.
      if (process.platform === 'win32' && basename(executable) === 'furn-desktop-driver-host' && args[0] === '--handshake') {
        return actual.runBoundedCommand(process.execPath, [executable, ...args], options);
      }
      return actual.runBoundedCommand(executable, args, options);
    },
  };
});

const windowsTest = process.platform === 'win32' ? test : test.skip;

const verifyMock = verifyMacOSDriver as jest.MockedFunction<typeof verifyMacOSDriver>;

const helperScript = [
  '#!/usr/bin/env node',
  "const fs = require('node:fs');",
  "const { join } = require('node:path');",
  "const { failureMarker, hello } = JSON.parse(fs.readFileSync(join(__dirname, 'handshake.json'), 'utf8'));",
  'if (fs.existsSync(failureMarker)) {',
  "  process.stderr.write('E'.repeat(20000) + 'CAUSE\\n');",
  '  process.exitCode = 1;',
  '} else {',
  '  process.stdout.write(JSON.stringify(hello));',
  '}',
  '',
].join('\n');

let cacheRoot: string;

// The helper is a separate process, and Jest gives the test its own copy of process.env, so a marker file switches it.
const failureMarker = () => path.join(cacheRoot, 'helper-fails');
const setHelperFailing = (failing: boolean) =>
  failing ? fs.writeFileSync(failureMarker(), '') : fs.rmSync(failureMarker(), { force: true });

const options = () => ({ cacheRoot, macosSigningIdentity: '', platform: 'macos' as const });
const resolveOnly = (extra: { signal?: AbortSignal } = {}) => resolveNativeDesktopDriver({ ...options(), buildPolicy: 'never', ...extra });
const exists = (...segments: string[]) => fs.existsSync(path.join(cacheRoot, 'v1', ...segments));

beforeEach(() => {
  cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-native-cache-'));
  jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
  (probeMacOSToolchain as jest.MockedFunction<typeof probeMacOSToolchain>).mockResolvedValue({
    fingerprint: 'test-toolchain',
  } as MacOSToolchain);
  verifyMock.mockReset();
  verifyMock.mockResolvedValue({ mode: 'adhoc' });
  (buildMacOSDriver as jest.MockedFunction<typeof buildMacOSDriver>).mockImplementation(async ({ buildId, sourceDigest, stagingRoot }) => {
    const bundlePath = path.join(stagingRoot, 'output', 'FurnDesktopDriverHost.app');
    const executableDirectory = path.join(bundlePath, 'Contents', 'MacOS');
    const executablePath = path.join(executableDirectory, 'furn-desktop-driver-host');
    fs.mkdirSync(executableDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(executableDirectory, 'handshake.json'),
      JSON.stringify({
        failureMarker: failureMarker(),
        hello: {
          architecture: 'arm64',
          buildId,
          features: [],
          protocol: { major: 1, minor: 0 },
          provider: 'macos',
          sourceDigest,
          type: 'hello',
        },
      }),
    );
    fs.writeFileSync(executablePath, helperScript);
    fs.chmodSync(executablePath, 0o755);
    const buildLogPath = path.join(stagingRoot, 'build.log');
    fs.writeFileSync(buildLogPath, 'built');
    return { buildLogPath, bundlePath, executablePath, signing: { mode: 'adhoc' } };
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 50 });
});

describe('native artifact cache verification', () => {
  test('keeps a selection whose handshake fails transiently and bounds the reported stderr', async () => {
    const built = await buildNativeDesktopDriver(options());

    setHelperFailing(true);
    const failure = await resolveOnly().then(
      () => {
        throw new Error('Expected resolution to fail.');
      },
      (error: Error & { code: string }) => error,
    );
    expect(failure).toMatchObject({ code: 'handshake-failed' });
    expect(failure.message).toContain('CAUSE');
    expect(failure.message.length).toBeLessThan(3_000);
    expect(exists('trash')).toBe(false);

    setHelperFailing(false);
    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: built.artifactId, origin: 'cache' });
  });

  test('keeps a selection when verification fails with a transient system error', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(Object.assign(new Error('too many open files'), { code: 'EMFILE' }));
    await expect(resolveOnly()).rejects.toMatchObject({ code: 'EMFILE' });
    expect(exists('trash')).toBe(false);

    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: built.artifactId, origin: 'cache' });
  });

  test('keeps a selection when resolution is aborted', async () => {
    await buildNativeDesktopDriver(options());
    const controller = new AbortController();
    controller.abort();

    await expect(resolveOnly({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(exists('trash')).toBe(false);
    await expect(resolveOnly()).resolves.toMatchObject({ origin: 'cache' });
  });

  test('quarantines a selection whose helper fails its integrity check', async () => {
    const built = await buildNativeDesktopDriver(options());
    fs.writeFileSync(built.executablePath, 'corrupt');

    await expect(resolveOnly()).rejects.toMatchObject({ code: 'no-verified-prebuilt' });
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
  });

  test('quarantines a selection whose signature verification reports a mismatch', async () => {
    await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(new NativeDriverError('signature-mismatch', 'signature changed'));
    await expect(resolveOnly()).rejects.toMatchObject({ code: 'no-verified-prebuilt' });
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
  });
});

describe('native artifact publication collisions', () => {
  test('keeps an existing artifact that cannot be verified right now and cleans up the new publication', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(Object.assign(new Error('too many open files'), { code: 'EMFILE' }));
    await expect(buildNativeDesktopDriver({ ...options(), force: true })).rejects.toMatchObject({ code: 'EMFILE' });

    expect(fs.existsSync(built.executablePath)).toBe(true);
    expect(exists('trash')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: built.artifactId, origin: 'cache' });
  });

  test('replaces an existing artifact only when it fails an integrity check', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(new NativeDriverError('signature-mismatch', 'signature changed'));
    await expect(buildNativeDesktopDriver({ ...options(), force: true })).resolves.toMatchObject({
      artifactId: built.artifactId,
      origin: 'built',
    });

    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
  });

  test('drops the new publication when the existing artifact still verifies', async () => {
    const built = await buildNativeDesktopDriver(options());

    await expect(buildNativeDesktopDriver({ ...options(), force: true })).resolves.toMatchObject({ artifactId: built.artifactId });
    expect(exists('trash')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
  });
});

describe('Windows native cache rename retries', () => {
  function failPublicationRenames(code: string, failures: number) {
    const error = Object.assign(new Error(`Publication rename failed: ${code}`), { code });
    const rename = fs.renameSync;
    const attempts = jest.fn();
    jest.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (typeof from === 'string' && path.basename(from).startsWith('publish-')) {
        attempts();
        if (attempts.mock.calls.length <= failures) throw error;
      }
      rename(from, to);
    });
    return { attempts, error };
  }

  windowsTest('publishes a verified helper after a transient sharing violation', async () => {
    const { attempts } = failPublicationRenames('EPERM', 1);
    const artifact = await buildNativeDesktopDriver(options());

    expect(attempts).toHaveBeenCalledTimes(2);
    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: artifact.artifactId, origin: 'cache' });
  });

  windowsTest('preserves a hard publication error without retrying', async () => {
    const { attempts, error } = failPublicationRenames('EXDEV', 1);
    await expect(buildNativeDesktopDriver(options())).rejects.toBe(error);

    expect(attempts).toHaveBeenCalledTimes(1);
    expect(exists('selections')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
  });

  windowsTest('quarantines an invalid selection after a transient sharing violation', async () => {
    const built = await buildNativeDesktopDriver(options());
    fs.writeFileSync(built.executablePath, 'corrupt');
    const rename = fs.renameSync;
    const attempts = jest.fn();
    jest.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (typeof from === 'string' && path.dirname(path.dirname(from)) === path.join(cacheRoot, 'v1', 'selections')) {
        attempts();
        if (attempts.mock.calls.length === 1) throw Object.assign(new Error('Sharing violation'), { code: 'EACCES' });
      }
      rename(from, to);
    });

    await expect(resolveOnly()).rejects.toMatchObject({ code: 'no-verified-prebuilt' });
    expect(attempts).toHaveBeenCalledTimes(2);
    const trash = path.join(cacheRoot, 'v1', 'trash');
    expect(fs.readdirSync(trash)).toHaveLength(1);
    expect(fs.readdirSync(path.join(trash, fs.readdirSync(trash)[0]))).toContain('error.json');
  });

  windowsTest('bounds sharing retries without disturbing an existing verified artifact', async () => {
    const existing = await buildNativeDesktopDriver(options());
    const { attempts, error } = failPublicationRenames('EBUSY', Infinity);
    await expect(buildNativeDesktopDriver({ ...options(), force: true })).rejects.toBe(error);

    expect(attempts).toHaveBeenCalledTimes(11);
    expect(exists('trash')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: existing.artifactId, origin: 'cache' });
  });
});

describe('native driver cache root configuration', () => {
  test('rejects an explicit empty root even when the environment supplies a path', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, FURN_DESKTOP_DRIVER_CACHE_ROOT: cacheRoot });
    await expect(resolveNativeDesktopDriver({ ...options(), buildPolicy: 'never', cacheRoot: '' })).rejects.toMatchObject({
      code: 'invalid-configuration',
    });
  });

  test('uses platform defaults when the cache root and build policy environment variables are empty', async () => {
    jest.spyOn(os, 'homedir').mockReturnValue(cacheRoot);
    jest.replaceProperty(process, 'env', {
      ...process.env,
      FURN_DESKTOP_DRIVER_BUILD_POLICY: '',
      FURN_DESKTOP_DRIVER_CACHE_ROOT: '',
      FURN_DESKTOP_DRIVER_HELPER_PATH: '',
      FURN_DESKTOP_DRIVER_INSTALL_ROOT: '',
      LOCALAPPDATA: cacheRoot,
    });
    const artifact = await resolveNativeDesktopDriver({ macosSigningIdentity: '', platform: 'macos' });
    expect(artifact.origin).toBe('built');
    expect(path.relative(defaultNativeDriverCacheRoot(), artifact.artifactRoot).split(path.sep)[0]).toBe('v1');
  });

  test('rejects a root beneath node_modules before creating anything', async () => {
    const root = path.join(cacheRoot, 'node_modules', '.cache', 'native');

    await expect(resolveNativeDesktopDriver({ ...options(), buildPolicy: 'never', cacheRoot: root })).rejects.toMatchObject({
      code: 'invalid-configuration',
    });
    await expect(buildNativeDesktopDriver({ ...options(), cacheRoot: root })).rejects.toMatchObject({ code: 'invalid-configuration' });
    expect(fs.existsSync(path.join(cacheRoot, 'node_modules'))).toBe(false);
  });
});

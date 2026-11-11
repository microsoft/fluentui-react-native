import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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

const cacheTest = process.platform === 'win32' ? test.skip : test;

const verifyMock = verifyMacOSDriver as jest.MockedFunction<typeof verifyMacOSDriver>;

function helperScript(buildId: string, sourceDigest: string): string {
  const hello = {
    architecture: 'arm64',
    buildId,
    features: [],
    protocol: { major: 1, minor: 0 },
    provider: 'macos',
    sourceDigest,
    type: 'hello',
  };
  return [
    '#!/usr/bin/env node',
    `if (require('node:fs').existsSync(${JSON.stringify(failureMarker())})) {`,
    "  process.stderr.write('E'.repeat(20000) + 'CAUSE\\n');",
    '  process.exitCode = 1;',
    '} else {',
    `  process.stdout.write(${JSON.stringify(JSON.stringify(hello))});`,
    '}',
    '',
  ].join('\n');
}

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
    const executablePath = path.join(bundlePath, 'Contents', 'MacOS', 'furn-desktop-driver-host');
    fs.mkdirSync(path.dirname(executablePath), { recursive: true });
    fs.writeFileSync(executablePath, helperScript(buildId, sourceDigest));
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
  cacheTest('keeps a selection whose handshake fails transiently and bounds the reported stderr', async () => {
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

  cacheTest('keeps a selection when verification fails with a transient system error', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(Object.assign(new Error('too many open files'), { code: 'EMFILE' }));
    await expect(resolveOnly()).rejects.toMatchObject({ code: 'EMFILE' });
    expect(exists('trash')).toBe(false);

    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: built.artifactId, origin: 'cache' });
  });

  cacheTest('keeps a selection when resolution is aborted', async () => {
    await buildNativeDesktopDriver(options());
    const controller = new AbortController();
    controller.abort();

    await expect(resolveOnly({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(exists('trash')).toBe(false);
    await expect(resolveOnly()).resolves.toMatchObject({ origin: 'cache' });
  });

  cacheTest('quarantines a selection whose helper fails its integrity check', async () => {
    const built = await buildNativeDesktopDriver(options());
    fs.writeFileSync(built.executablePath, 'corrupt');

    await expect(resolveOnly()).rejects.toMatchObject({ code: 'no-verified-prebuilt' });
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
  });

  cacheTest('quarantines a selection whose signature verification reports a mismatch', async () => {
    await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(new NativeDriverError('signature-mismatch', 'signature changed'));
    await expect(resolveOnly()).rejects.toMatchObject({ code: 'no-verified-prebuilt' });
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
  });
});

describe('native artifact publication collisions', () => {
  cacheTest('keeps an existing artifact that cannot be verified right now and cleans up the new publication', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(Object.assign(new Error('too many open files'), { code: 'EMFILE' }));
    await expect(buildNativeDesktopDriver({ ...options(), force: true })).rejects.toMatchObject({ code: 'EMFILE' });

    expect(fs.existsSync(built.executablePath)).toBe(true);
    expect(exists('trash')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
    await expect(resolveOnly()).resolves.toMatchObject({ artifactId: built.artifactId, origin: 'cache' });
  });

  cacheTest('replaces an existing artifact only when it fails an integrity check', async () => {
    const built = await buildNativeDesktopDriver(options());

    verifyMock.mockRejectedValueOnce(new NativeDriverError('signature-mismatch', 'signature changed'));
    await expect(buildNativeDesktopDriver({ ...options(), force: true })).resolves.toMatchObject({
      artifactId: built.artifactId,
      origin: 'built',
    });

    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
  });

  cacheTest('drops the new publication when the existing artifact still verifies', async () => {
    const built = await buildNativeDesktopDriver(options());

    await expect(buildNativeDesktopDriver({ ...options(), force: true })).resolves.toMatchObject({ artifactId: built.artifactId });
    expect(exists('trash')).toBe(false);
    expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'staging'))).toEqual([]);
  });
});

describe('native driver cache root configuration', () => {
  test('rejects a root beneath node_modules before creating anything', async () => {
    const root = path.join(cacheRoot, 'node_modules', '.cache', 'native');

    await expect(resolveNativeDesktopDriver({ ...options(), buildPolicy: 'never', cacheRoot: root })).rejects.toMatchObject({
      code: 'invalid-configuration',
    });
    await expect(buildNativeDesktopDriver({ ...options(), cacheRoot: root })).rejects.toMatchObject({ code: 'invalid-configuration' });
    expect(fs.existsSync(path.join(cacheRoot, 'node_modules'))).toBe(false);
  });
});

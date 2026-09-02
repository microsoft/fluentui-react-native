import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { encodeJsonFrame, NativeFrameDecoder } from '../hosts/native/framing';
import { NativeHostProcess } from '../hosts/native/NativeHostProcess';
import type { NativeHostJsonMessage } from './types';
import { buildNativeDesktopDriver, resolveNativeDesktopDriver } from './nativeDriver';

jest.setTimeout(120_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;
const macosTest = process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

describe('native driver build and resolution', () => {
  macosTest('builds, signs, reuses, and handshakes with the macOS helper', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-macos-native-'));
    const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    try {
      const built = await buildNativeDesktopDriver({ cacheRoot, platform: 'macos' });
      expect(built).toMatchObject({
        architecture: 'arm64',
        endpoints: ['macos'],
        origin: 'built',
        provider: 'macos',
        signing: { mode: 'adhoc' },
        wireProtocol: { major: 1, minor: 0 },
      });
      expect(built.executablePath).toContain(`${path.sep}FurnDesktopDriverHost.app${path.sep}Contents${path.sep}MacOS${path.sep}`);

      const reused = await buildNativeDesktopDriver({ cacheRoot, platform: 'macos' });
      expect(reused).toMatchObject({
        artifactId: built.artifactId,
        origin: 'cache',
      });
      const resolved = await resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'macos' });
      expect(resolved.artifactId).toBe(built.artifactId);

      const helper = await NativeHostProcess.start({ artifact: resolved });
      await expect(helper.request('probe', { endpoint: 'macos' })).resolves.toMatchObject({
        result: {
          endpoint: 'macos',
          platformName: 'macos',
          protocolVersion: 1,
        },
      });
      await helper.dispose();

      const selfTest = spawnSync(resolved.executablePath, ['--self-test'], {
        encoding: 'utf8',
        timeout: 120_000,
      });
      expect(selfTest.status).toBe(0);
      expect(selfTest.stdout).toContain('ok ');
    } finally {
      emitWarning.mockRestore();
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  windowsTest('builds, reuses, resolves, and handshakes with the Windows helper', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-native-'));
    const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-external-'));
    try {
      const built = await buildNativeDesktopDriver({ cacheRoot, platform: 'windows' });
      expect(built).toMatchObject({
        architecture: 'x64',
        endpoints: ['windows', 'win32'],
        origin: 'built',
        provider: 'windows',
        wireProtocol: { major: 1, minor: 0 },
      });
      expect(fs.existsSync(built.executablePath)).toBe(true);

      const reused = await buildNativeDesktopDriver({ cacheRoot, platform: 'win32' });
      expect(reused).toMatchObject({
        artifactId: built.artifactId,
        origin: 'cache',
      });

      const resolved = await resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' });
      expect(resolved.artifactId).toBe(built.artifactId);

      const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
      try {
        const compatibilityRoot = path.dirname(path.dirname(resolved.artifactRoot));
        const incompatibleRoot = path.join(compatibilityRoot, 'incompatible-build', 'incompatible-artifact');
        fs.cpSync(resolved.artifactRoot, incompatibleRoot, { recursive: true });
        const incompatibleManifestPath = path.join(incompatibleRoot, 'artifact.json');
        const incompatibleManifest = JSON.parse(fs.readFileSync(incompatibleManifestPath, 'utf8')) as Record<string, unknown>;
        incompatibleManifest.compatibilityKey = 'incompatible-context';
        fs.writeFileSync(incompatibleManifestPath, `${JSON.stringify(incompatibleManifest, null, 2)}\n`);
        const compatibilityDirectory = fs.readdirSync(path.join(cacheRoot, 'v1', 'selections')).at(0);
        if (!compatibilityDirectory) {
          throw new Error('The native build did not write its compatibility selection.');
        }
        const selectionRoot = path.join(cacheRoot, 'v1', 'selections', compatibilityDirectory);
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzy-incompatible.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, incompatibleRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        const unrelatedRoot = path.join(path.dirname(compatibilityRoot), 'unrelated-context', 'build-context', 'artifact-context');
        fs.mkdirSync(unrelatedRoot, { recursive: true });
        fs.writeFileSync(path.join(unrelatedRoot, 'artifact.json'), '{');
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzz-unrelated.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, unrelatedRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        const externalArtifactRoot = path.join(externalRoot, 'artifact');
        fs.cpSync(resolved.artifactRoot, externalArtifactRoot, { recursive: true });
        const junctionRoot = path.join(compatibilityRoot, 'junction-build', 'junction-artifact');
        fs.mkdirSync(path.dirname(junctionRoot), { recursive: true });
        fs.symlinkSync(externalArtifactRoot, junctionRoot, 'junction');
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzx-junction.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, junctionRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        await expect(resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' })).resolves.toMatchObject({
          artifactId: resolved.artifactId,
        });
        expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).toHaveLength(3);
        expect(fs.existsSync(incompatibleRoot)).toBe(true);
        expect(fs.existsSync(unrelatedRoot)).toBe(true);
        expect(fs.existsSync(externalArtifactRoot)).toBe(true);

        await expect(NativeHostProcess.start({ artifact: { ...resolved, buildId: 'mismatched-build' } })).rejects.toMatchObject({
          code: 'handshake-failed',
        });
        await expectMalformedJsonRecovery(resolved.executablePath);

        const helper = await NativeHostProcess.start({ artifact: resolved });
        await expect(helper.request('probe', { padding: 'x'.repeat(8 * 1024 * 1024) })).rejects.toThrow('exceeds');
        await expect(helper.request('probe', { endpoint: 'windows' })).resolves.toMatchObject({
          result: {
            endpoint: 'windows',
            platformName: 'windows',
            protocolVersion: 1,
          },
        });
        await helper.dispose();

        fs.writeFileSync(resolved.executablePath, 'corrupt');
        await expect(resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' })).rejects.toMatchObject({
          code: 'no-verified-prebuilt',
        });
        expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).toHaveLength(4);
        expect(emitWarning).toHaveBeenCalledWith(expect.stringContaining('Quarantined invalid native driver cache selection'), {
          code: 'FURN_NATIVE_DRIVER_CACHE_INVALID',
        });
      } finally {
        emitWarning.mockRestore();
      }
    } finally {
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
      fs.rmSync(externalRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  test('rejects unsupported V1 architecture combinations before building', async () => {
    await expect(buildNativeDesktopDriver({ architecture: 'arm64', platform: 'windows' })).rejects.toMatchObject({
      code: 'unsupported-platform',
    });
  });

  async function expectMalformedJsonRecovery(executablePath: string): Promise<void> {
    const child = spawn(executablePath, ['--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const closed = new Promise<void>((resolve) => child.once('close', () => resolve()));
    const decoder = new NativeFrameDecoder();
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.resume();
    try {
      await waitForMessage(decoder, (message) => message.type === 'hello');
      child.stdin.write(encodeMalformedJsonFrame());
      child.stdin.write(
        encodeJsonFrame({
          command: 'probe',
          id: 'x'.repeat(1024),
          params: { endpoint: 'windows' },
          type: 'request',
        }),
      );
      child.stdin.write(encodeJsonFrame({ id: 'x'.repeat(1024), type: 'cancel' }));

      const probe = waitForMessage(decoder, (message) => message.type === 'response' && message.id === 'probe-after-malformed');
      child.stdin.write(
        encodeJsonFrame({
          command: 'probe',
          id: 'probe-after-malformed',
          params: { endpoint: 'windows' },
          type: 'request',
        }),
      );
      await expect(probe).resolves.toMatchObject({
        result: {
          endpoint: 'windows',
          platformName: 'windows',
          protocolVersion: 1,
        },
      });

      const disposed = waitForMessage(decoder, (message) => message.type === 'response' && message.id === 'dispose-after-malformed');
      child.stdin.write(
        encodeJsonFrame({
          command: 'dispose',
          id: 'dispose-after-malformed',
          params: {},
          type: 'request',
        }),
      );
      await disposed;
      await closed;
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await closed;
      }
    }
  }

  function encodeMalformedJsonFrame(): Buffer {
    const payload = Buffer.from('{', 'utf8');
    const header = Buffer.alloc(12);
    header.write('FDR1', 0, 'ascii');
    header[4] = 1;
    header.writeUInt32LE(payload.length, 8);
    return Buffer.concat([header, payload]);
  }

  function waitForMessage(
    decoder: NativeFrameDecoder,
    predicate: (message: NativeHostJsonMessage) => boolean,
  ): Promise<NativeHostJsonMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out waiting for the native helper response.'));
      }, 5000);
      const onJson = (message: NativeHostJsonMessage) => {
        if (predicate(message)) {
          cleanup();
          resolve(message);
        }
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        clearTimeout(timeout);
        decoder.off('json', onJson);
        decoder.off('error', onError);
      };
      decoder.on('json', onJson);
      decoder.once('error', onError);
    });
  }
});

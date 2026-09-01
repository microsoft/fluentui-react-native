import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { NativeHostProcess } from '../hosts/native/NativeHostProcess';
import { buildNativeDesktopDriver, resolveNativeDesktopDriver } from './nativeDriver';

jest.setTimeout(120_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

describe('native driver build and resolution', () => {
  windowsTest('builds, reuses, resolves, and handshakes with the Windows helper', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-native-'));
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

      const helper = await NativeHostProcess.start({ artifact: resolved });
      await expect(helper.request('probe', { endpoint: 'windows' })).resolves.toMatchObject({
        result: {
          endpoint: 'windows',
          platformName: 'windows',
          protocolVersion: 1,
        },
      });
      await helper.dispose();
    } finally {
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  test('rejects unsupported V1 architecture combinations before building', async () => {
    await expect(buildNativeDesktopDriver({ architecture: 'arm64', platform: 'windows' })).rejects.toMatchObject({
      code: 'unsupported-platform',
    });
  });
});

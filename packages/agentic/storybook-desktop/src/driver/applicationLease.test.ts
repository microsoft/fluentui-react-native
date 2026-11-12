import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import { updateWindowsApplicationLease } from './applicationLease';
import { createFixturePrivateStorage } from './fixtures/privateStorage';
import { createFixtureStoredManifest } from './fixtures/storedManifest.cjs';
import { driverManifestDigest, publishDriverManifest } from './generatedManifest';

jest.mock('@fluentui-react-native/desktop-driver/native', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver/native'),
  verifyNativeDriverArtifact: jest.fn(async (artifact) => artifact),
}));

describe.each(['windows', 'win32'] as const)('%s smoke application lease', (endpoint) => {
  let root: string;
  let manifestPath: string;
  let leasePath: string;
  let handoff: string;
  const application = () => ({
    processId: 123,
    processStartedAt: '2026-11-12T00:00:00.1234567Z',
    windowTitle: 'Fixture',
    ...(endpoint === 'windows' ? { aumid: 'Fixture!App' } : { executablePath: 'C:\\Fixture\\host.exe' }),
  });

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'storybook-lease-'));
    manifestPath = path.join(root, 'driver-manifest.json');
    leasePath = path.join(root, '.private', `application-lease.${endpoint}.json`);
    const stored = createFixtureStoredManifest(root, {
      endpoint,
      entries: [],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 1,
    });
    const { credentials: _credentials, ...manifest } = stored;
    handoff = await publishDriverManifest(
      { ...manifest, bridgeNonce: 'bridge-only', application: { ...manifest.application, leaseNonce: 'attach-only' } },
      manifestPath,
      createFixturePrivateStorage,
    );
    jest.mocked(verifyNativeDriverArtifact).mockClear();
  });
  afterEach(() => fs.rmSync(root, { force: true, recursive: true }));

  test('publishes, replaces, and removes only the receipted private record through the storage adapter', async () => {
    const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const storage = await createFixturePrivateStorage(stored.credentials.root, stored.nativeDriver);
    const publish = jest.spyOn(storage, 'publish');
    const remove = jest.spyOn(storage, 'remove');
    const createStorage = jest.fn(async () => storage);
    const first = await updateWindowsApplicationLease(
      manifestPath,
      handoff,
      { operation: 'publish', application: application() },
      createStorage,
    );
    const firstRecord = fs.readFileSync(leasePath, 'utf8');
    expect(first).toBe(driverManifestDigest(firstRecord));
    expect(JSON.parse(firstRecord)).toEqual({ ...application(), endpoint, nonce: 'attach-only', schemaVersion: 1 });
    expect(firstRecord).not.toContain('bridge-only');
    expect(publish).toHaveBeenCalledWith(path.basename(leasePath), firstRecord);
    expect(createStorage).toHaveBeenCalledWith(stored.credentials.root, stored.nativeDriver);
    expect(verifyNativeDriverArtifact).toHaveBeenCalledWith(stored.nativeDriver);
    await expect(
      updateWindowsApplicationLease(
        manifestPath,
        handoff,
        { operation: 'publish', application: { ...application(), processId: 456 } },
        createStorage,
      ),
    ).rejects.toThrow('previous receipt');
    expect(fs.readFileSync(leasePath, 'utf8')).toBe(firstRecord);
    const second = await updateWindowsApplicationLease(
      manifestPath,
      handoff,
      { operation: 'publish', application: { ...application(), processId: 456 }, previousDigest: first },
      createStorage,
    );
    expect(remove).toHaveBeenCalledWith(path.basename(leasePath), firstRecord);
    await updateWindowsApplicationLease(manifestPath, handoff, { operation: 'remove', digest: first! }, createStorage);
    expect(JSON.parse(fs.readFileSync(leasePath, 'utf8')).processId).toBe(456);
    await updateWindowsApplicationLease(manifestPath, handoff, { operation: 'remove', digest: second! }, createStorage);
    expect(fs.existsSync(leasePath)).toBe(false);
    expect(fs.existsSync(path.join(stored.credentials.root, stored.credentials.name))).toBe(true);
  });

  test.each(['missing-handoff', 'tampered-manifest', 'unknown-field'])(
    'refuses %s before verifying a helper or opening private storage',
    async (kind) => {
      if (kind !== 'missing-handoff') {
        const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (kind === 'unknown-field') stored.application.leaseNonce = 'public-secret';
        else stored.nativeDriver.executablePath = path.join(root, 'untrusted-helper');
        fs.writeFileSync(manifestPath, JSON.stringify(stored));
      }
      const createStorage = jest.fn(createFixturePrivateStorage);
      await expect(
        updateWindowsApplicationLease(
          manifestPath,
          kind === 'missing-handoff' ? '' : handoff,
          { operation: 'publish', application: application() },
          createStorage,
        ),
      ).rejects.toThrow(kind === 'unknown-field' ? 'driver manifest' : 'trusted parent handoff');
      expect(verifyNativeDriverArtifact).not.toHaveBeenCalled();
      expect(createStorage).not.toHaveBeenCalled();
      expect(fs.existsSync(leasePath)).toBe(false);
    },
  );

  test('rejects a mismatched app window without publishing an attach credential', async () => {
    await expect(
      updateWindowsApplicationLease(
        manifestPath,
        handoff,
        { operation: 'publish', application: { ...application(), windowTitle: 'Another application' } },
        createFixturePrivateStorage,
      ),
    ).rejects.toThrow('lease identity');
    expect(fs.existsSync(leasePath)).toBe(false);
  });

  test('the actual smoke helper refuses an edited manifest without exposing credentials', () => {
    const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    stored.targetId = 'tampered-target';
    fs.writeFileSync(manifestPath, JSON.stringify(stored));
    const result = spawnSync(
      process.execPath,
      [
        path.resolve(__dirname, '../../config/application-lease.cjs'),
        'publish',
        '--process-id',
        '123',
        '--process-started-at',
        application().processStartedAt,
        '--window-title',
        'Fixture',
        ...(endpoint === 'windows' ? ['--aumid', 'Fixture!App'] : ['--executable-path', 'C:\\Fixture\\host.exe']),
      ],
      {
        encoding: 'utf8',
        env: { ...process.env, STORYBOOK_DRIVER_MANIFEST: manifestPath, STORYBOOK_DRIVER_HANDOFF: handoff },
        timeout: 20_000,
      },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Application lease update failed');
    expect(result.stdout + result.stderr).not.toMatch(/bridge-only|attach-only/);
    expect(fs.existsSync(leasePath)).toBe(false);
  });
});

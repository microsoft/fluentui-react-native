import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import {
  createStorybookMacOSApplicationLeaseResource,
  updateWindowsApplicationLease,
  waitForStorybookMacOSApplicationLease,
} from './applicationLease';
import { createFixturePrivateStorage } from './fixtures/privateStorage';
import { createFixtureStoredManifest } from './fixtures/storedManifest.cjs';
import { driverManifestDigest, publishDriverManifest } from './generatedManifest';

jest.mock('@fluentui-react-native/desktop-driver/native', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver/native'),
  verifyNativeDriverArtifact: jest.fn(async (artifact) => artifact),
}));

describe('host-owned macOS Storybook application lease', () => {
  let root: string;
  let manifestPath: string;
  let leasePath: string;
  let handoff: string;

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'storybook-macos-lease-'));
    manifestPath = path.join(root, 'driver-manifest.json');
    leasePath = path.join(root, '.private', 'application-lease.macos.json');
    const stored = createFixtureStoredManifest(root, {
      endpoint: 'macos',
      entries: [],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 1,
    });
    const { credentials: _credentials, ...manifest } = stored;
    handoff = await publishDriverManifest(
      {
        ...manifest,
        bridgeNonce: 'bridge-only',
        application: { ...manifest.application, bundleIdentifier: 'com.example.storybook', leaseNonce: 'attach-only' },
      },
      manifestPath,
      createFixturePrivateStorage,
    );
    jest.mocked(verifyNativeDriverArtifact).mockClear();
  });
  afterEach(() => fs.rmSync(root, { force: true, recursive: true }));

  test('tracks the verified app through relaunch and withdraws its own record on shutdown', async () => {
    const state = {
      observation: {
        processId: 123,
        processStartedAt: '2026-11-12T00:00:00.123456Z',
        executablePath: '/Applications/Fixture.app/Contents/MacOS/Fixture',
      },
    };
    const inspector = { inspect: jest.fn(async () => state.observation), close: jest.fn(async () => undefined) };
    const openInspector = jest.fn(async () => inspector);
    const addSecret = jest.fn();
    const onFailure = jest.fn();
    const controller = new AbortController();
    const resource = createStorybookMacOSApplicationLeaseResource({
      manifestPath,
      handoff,
      createStorage: createFixturePrivateStorage,
      openInspector,
      addSecret,
      onFailure,
      intervalMs: 10,
    });
    const plan = resource.prepare({ signal: controller.signal, targetId: 'fixture', targetInstanceId: 'instance' });
    expect(openInspector).not.toHaveBeenCalled();
    await plan.acquire(controller.signal);
    try {
      await waitForStorybookMacOSApplicationLease(manifestPath, { timeoutMs: 2000, createStorage: createFixturePrivateStorage });
      expect(JSON.parse(fs.readFileSync(leasePath, 'utf8'))).toMatchObject({
        ...state.observation,
        bundleIdentifier: 'com.example.storybook',
        nonce: 'attach-only',
        windowTitle: 'Fixture',
      });
      expect(addSecret).toHaveBeenCalledWith('attach-only');
      expect(openInspector).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: 'fixture',
          selector: { bundleIdentifier: 'com.example.storybook', windowTitle: 'Fixture' },
        }),
      );
      state.observation = { ...state.observation, processId: 456, processStartedAt: '2026-11-12T00:00:01.123456Z' };
      for (let attempt = 0; attempt < 200; attempt++) {
        if (fs.existsSync(leasePath) && JSON.parse(fs.readFileSync(leasePath, 'utf8')).processId === 456) break;
        await new Promise<void>((resolve) => setTimeout(resolve, 10));
      }
      expect(JSON.parse(fs.readFileSync(leasePath, 'utf8')).processId).toBe(456);
      expect(onFailure).not.toHaveBeenCalled();
    } finally {
      await plan.dispose();
    }
    expect(inspector.close).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(leasePath)).toBe(false);
  });

  test('refuses a changed manifest before opening an inspector', async () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.targetId = 'different-target';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const openInspector = jest.fn();
    const controller = new AbortController();
    const plan = createStorybookMacOSApplicationLeaseResource({
      manifestPath,
      handoff,
      createStorage: createFixturePrivateStorage,
      openInspector,
      addSecret: jest.fn(),
      onFailure: jest.fn(),
    }).prepare({ signal: controller.signal, targetId: 'fixture', targetInstanceId: 'instance' });
    await expect(plan.acquire(controller.signal)).rejects.toThrow('trusted parent handoff');
    await plan.dispose();
    expect(openInspector).not.toHaveBeenCalled();
  });

  test('a waiting client refuses a foreign lease and does not remove it', async () => {
    fs.writeFileSync(leasePath, JSON.stringify({ schemaVersion: 1, endpoint: 'macos', nonce: 'foreign' }));
    await expect(
      waitForStorybookMacOSApplicationLease(manifestPath, { timeoutMs: 100, createStorage: createFixturePrivateStorage }),
    ).rejects.toThrow('does not match');
    expect(JSON.parse(fs.readFileSync(leasePath, 'utf8')).nonce).toBe('foreign');
  });

  test('a waiting client respects its cancellation without publishing a lease', async () => {
    const controller = new AbortController();
    const waiting = waitForStorybookMacOSApplicationLease(manifestPath, {
      timeoutMs: 2000,
      signal: controller.signal,
      createStorage: createFixturePrivateStorage,
    });
    controller.abort(new Error('run cancelled'));
    await expect(waiting).rejects.toThrow('run cancelled');
    expect(fs.existsSync(leasePath)).toBe(false);
  });
});

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
    await expect(
      updateWindowsApplicationLease(manifestPath, handoff, { operation: 'remove', digest: first! }, createStorage),
    ).rejects.toThrow('foreign record was preserved');
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

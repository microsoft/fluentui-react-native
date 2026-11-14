import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { generatedPathIdentity, sameGeneratedPath } from '../../config/generated-contract.cjs';
import { createFixturePrivateStorage } from './fixtures/privateStorage';
import { createFixtureStoredManifest } from './fixtures/storedManifest.cjs';
import type { DesktopStorybookDriverManifest } from './driverManifest';
import { createStorybookPrivateStorage, publishDriverManifest, readDriverManifest } from './generatedManifest';

const mockMacOSStorage = jest.fn();
const mockWindowsStorage = jest.fn();
const mockVerify = jest.fn();
jest.mock('@fluentui-react-native/desktop-driver/authority', () => ({
  createMacOSPrivateStorage: (...args: unknown[]) => mockMacOSStorage(...args),
  createWindowsPrivateStorage: (...args: unknown[]) => mockWindowsStorage(...args),
}));
jest.mock('@fluentui-react-native/desktop-driver/native', () => ({
  verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args),
}));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
let root: string;
let privateParent: string;
let manifestPath: string;
let manifest: DesktopStorybookDriverManifest;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'storybook-storage-'));
  privateParent = path.join(root, 'os-known-folder');
  manifestPath = path.join(root, 'workspace', 'generated', 'manifest.json');
  const { credentials: _credentials, ...stored } = createFixtureStoredManifest(root, {
    endpoint: 'windows',
    entries: [],
    platformManifestDigest: 'platform',
    portablePlanDigest: 'portable',
    schemaVersion: 1,
  });
  manifest = { ...stored, bridgeNonce: 'bridge-only', application: { ...stored.application, leaseNonce: 'attach-only' } };
  mockMacOSStorage.mockReset().mockResolvedValue({});
  mockWindowsStorage.mockReset().mockImplementation(async ({ artifact, root: requestedRoot }) => {
    const directory = requestedRoot ?? privateParent;
    return { ...(await createFixturePrivateStorage(directory, artifact)), root: directory };
  });
  mockVerify.mockReset().mockImplementation(async (artifact: NativeDriverArtifact) => artifact);
});
afterEach(() => {
  Object.defineProperty(process, 'platform', originalPlatform);
  fs.rmSync(root, { force: true, recursive: true });
});

test.each(['darwin', 'win32', 'linux'] as const)('selects only the %s host storage boundary', async (platform) => {
  Object.defineProperty(process, 'platform', { value: platform });
  if (platform === 'linux') {
    await expect(createStorybookPrivateStorage(root, manifest.nativeDriver)).rejects.toThrow('portable tests must inject');
    expect(mockMacOSStorage).not.toHaveBeenCalled();
    expect(mockWindowsStorage).not.toHaveBeenCalled();
  } else {
    await createStorybookPrivateStorage(root, manifest.nativeDriver);
    if (platform === 'win32') {
      expect(mockWindowsStorage).toHaveBeenCalledWith({ artifact: manifest.nativeDriver, root });
      expect(mockMacOSStorage).not.toHaveBeenCalled();
    } else {
      expect(mockMacOSStorage).toHaveBeenCalledWith(root);
      expect(mockWindowsStorage).not.toHaveBeenCalled();
    }
  }
});

test('keeps Windows credentials out of the workspace in a helper-selected, project-specific namespace', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const handoff = await publishDriverManifest(manifest, manifestPath);
  const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const namespace = stored.credentials.root;
  expect(path.dirname(namespace)).toBe(privateParent);
  expect(path.basename(namespace)).toMatch(/^storybook-[0-9a-f]{64}$/);
  expect(stored.application.leasePath).toBe(path.join(namespace, 'application-lease.windows.json'));
  expect(fs.existsSync(path.join(path.dirname(manifestPath), '.private'))).toBe(false);
  mockWindowsStorage.mockClear();
  mockVerify.mockClear();
  await expect(readDriverManifest(manifestPath, handoff)).resolves.toMatchObject({
    bridgeNonce: 'bridge-only',
    application: { leaseNonce: 'attach-only', leasePath: stored.application.leasePath },
  });
  expect(mockWindowsStorage.mock.calls.map(([options]) => options.root)).toEqual([undefined, namespace]);
  expect(mockVerify.mock.invocationCallOrder[0]).toBeLessThan(mockWindowsStorage.mock.invocationCallOrder[0]);

  const otherPath = path.join(root, 'other-workspace', 'generated', 'manifest.json');
  await publishDriverManifest(manifest, otherPath);
  expect(JSON.parse(fs.readFileSync(otherPath, 'utf8')).credentials.root).not.toBe(namespace);
});

test('refuses a tampered Windows namespace before verifying or opening any helper', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const handoff = await publishDriverManifest(manifest, manifestPath);
  const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  stored.credentials.root = path.join(root, 'editable-location');
  stored.application.leasePath = path.join(stored.credentials.root, 'application-lease.windows.json');
  fs.writeFileSync(manifestPath, JSON.stringify(stored));
  mockWindowsStorage.mockClear();
  mockVerify.mockClear();
  await expect(readDriverManifest(manifestPath, handoff)).rejects.toThrow('trusted parent handoff');
  expect(mockVerify).not.toHaveBeenCalled();
  expect(mockWindowsStorage).not.toHaveBeenCalled();
});

test('requires the namespace selected by the current OS root instead of adopting the manifest root', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const handoff = await publishDriverManifest(manifest, manifestPath);
  privateParent = path.join(root, 'another-os-root');
  mockWindowsStorage.mockClear();
  await expect(readDriverManifest(manifestPath, handoff)).rejects.toThrow('generated instance namespace');
  expect(mockWindowsStorage.mock.calls.map(([options]) => options.root)).toEqual([undefined]);
});

test('reports the closed Windows refusal reason without exposing helper details', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  mockWindowsStorage.mockRejectedValue(
    Object.defineProperty(new Error('Desktop Driver private storage is unsafe or inaccessible.'), 'reason', { value: 'ancestor' }),
  );
  await expect(publishDriverManifest(manifest, manifestPath)).rejects.toThrow('reason: ancestor');
  expect(fs.existsSync(manifestPath)).toBe(false);
});

test('pins Windows project identity across drive-letter, separator, and casing aliases without accepting another volume', () => {
  const generated = 'D:\\agent\\Project\\generated';
  const alias = 'd:/AGENT/project/generated';
  expect(sameGeneratedPath(generated, alias, path.win32)).toBe(true);
  expect(generatedPathIdentity(generated, path.win32)).toBe(generatedPathIdentity(alias, path.win32));
  expect(sameGeneratedPath(generated, 'C:\\agent\\Project\\generated', path.win32)).toBe(false);
  expect(sameGeneratedPath('/Project/generated', '/project/generated', path.posix)).toBe(false);
});

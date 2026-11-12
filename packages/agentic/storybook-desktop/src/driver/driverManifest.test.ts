import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifest, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';

import { createDesktopStorybookInstance } from '../config/instance';
import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { createDesktopStorybookDriverManifest, writeDesktopStorybookDriverManifest } from './driverManifest';
import { createFixturePrivateStorage } from './fixtures/privateStorage';
import { readDriverManifest } from './generatedManifest';

const storybookRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const storyManifest: DesktopStoryManifest = {
  endpoint: 'windows',
  entries: [],
  platformManifestDigest: 'platform-digest',
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1,
};
const nativeDriver: NativeDriverArtifact = {
  architecture: 'x64',
  artifactId: 'artifact',
  artifactRoot: 'artifact-root',
  buildFingerprint: 'build',
  buildId: 'build-id',
  compatibilityKey: 'compatibility',
  configuration: 'release',
  endpoints: ['windows', 'win32'],
  executablePath: 'driver.exe',
  features: ['probe'],
  origin: 'cache',
  provider: 'windows',
  schemaVersion: 1,
  signing: { mode: 'none' },
  sourceDigest: 'source',
  wireProtocol: { major: 1, minor: 0 },
};

describe('Desktop Storybook driver manifest', () => {
  test('records native helper and nonce-bound application identity', () => {
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot, wdio: { timeoutMs: 12_345, tag: 'smoke', reporter: 'tap' } });
    const instance = createDesktopStorybookInstance({
      bundleIdentifierPrefix: config.macosBundleIdentifier,
      projectRoot: config.projectRoot,
    });
    const manifest = createDesktopStorybookDriverManifest({
      bridgeNonce: 'nonce',
      config,
      instance,
      nativeDriver,
      platform: 'windows',
      storyManifest,
    });

    expect(manifest).toMatchObject({
      application: {
        leaseNonce: expect.any(String),
        leasePath: path.join(storybookRoot, 'storybook-desktop.generated', '.private', 'application-lease.windows.json'),
        windowTitle: 'Agentic Components Storybook',
      },
      nativeDriver,
      schemaVersion: 3,
      wdio: { timeoutMs: 12_345, tag: 'smoke', reporter: 'tap' },
    });
    expect(manifest.application.leaseNonce).not.toBe(manifest.bridgeNonce);

    const macosManifest = createDesktopStorybookDriverManifest({
      bridgeNonce: 'nonce',
      config,
      instance,
      nativeDriver: {
        ...nativeDriver,
        architecture: 'arm64',
        endpoints: ['macos'],
        provider: 'macos',
        signing: { mode: 'adhoc' },
      },
      platform: 'macos',
      storyManifest: { ...storyManifest, endpoint: 'macos' },
    });
    expect(macosManifest.application).toMatchObject({
      bundleIdentifier: instance.bundleIdentifier,
      leasePath: path.join(storybookRoot, 'storybook-desktop.generated', '.private', 'application-lease.macos.json'),
    });
    expect(macosManifest.renderer).toBe('fabric');
  });

  test('records macOS Paper without changing the endpoint or native identity', () => {
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot });
    const instance = createDesktopStorybookInstance({
      bundleIdentifierPrefix: config.macosBundleIdentifier,
      projectRoot: config.projectRoot,
    });
    const manifest = createDesktopStorybookDriverManifest({
      config,
      instance,
      nativeDriver,
      platform: 'macos',
      renderer: 'paper',
      storyManifest: { ...storyManifest, endpoint: 'macos' },
    });

    expect(manifest).toMatchObject({
      application: { bundleIdentifier: instance.bundleIdentifier },
      endpoint: 'macos',
      renderer: 'paper',
      targetId: 'agenticstorybook-macos',
    });
  });

  test('removes stale readiness and leases, publishing secrets only through private storage', async () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-driver-manifest-'));
    try {
      const config = makeDesktopStorybookConfig({
        projectRoot: storybookRoot,
      });
      const instance = createDesktopStorybookInstance({
        bundleIdentifierPrefix: config.macosBundleIdentifier,
        projectRoot: config.projectRoot,
      });
      const created = createDesktopStorybookDriverManifest({
        agent: { descriptor: 'agent.json' },
        bridgeNonce: 'nonce',
        config,
        instance,
        nativeDriver,
        platform: 'windows',
        storyManifest,
      });
      expect(created.agent).toEqual({
        descriptor: 'agent.json',
        readyPath: path.join(storybookRoot, 'storybook-desktop.generated', 'agent-ready.windows.json'),
      });
      // Stale files live in the temporary directory so the test cannot remove a live instance's lease or readiness record.
      const readyPath = path.join(temporaryDirectory, 'agent-ready.windows.json');
      const manifest = {
        ...created,
        agent: { descriptor: 'agent.json', readyPath },
        application: { ...created.application, leasePath: path.join(temporaryDirectory, '.private', 'application-lease.windows.json') },
      };
      fs.mkdirSync(path.dirname(manifest.application.leasePath), { recursive: true, mode: 0o700 });
      fs.writeFileSync(manifest.application.leasePath, '{}');
      fs.writeFileSync(readyPath, '{}');
      const outputPath = path.join(temporaryDirectory, 'driver-manifest.json');

      await writeDesktopStorybookDriverManifest(manifest, outputPath, createFixturePrivateStorage);

      expect(fs.existsSync(manifest.application.leasePath)).toBe(false);
      expect(fs.existsSync(readyPath)).toBe(false);
      const serialized = fs.readFileSync(outputPath, 'utf8');
      expect(JSON.parse(serialized)).toMatchObject({ schemaVersion: 3 });
      expect(serialized).not.toContain('"leaseNonce"');
      expect(serialized).not.toContain('"bridgeNonce"');
      await expect(readDriverManifest(outputPath, undefined, createFixturePrivateStorage)).resolves.toMatchObject({
        bridgeNonce: 'nonce',
        application: { leaseNonce: created.application.leaseNonce },
      });
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

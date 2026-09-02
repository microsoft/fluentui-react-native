import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifest, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';

import { createDesktopStorybookInstance } from '../config/instance';
import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { createDesktopStorybookDriverManifest, writeDesktopStorybookDriverManifest } from './driverManifest';

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
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot });
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
        leaseNonce: 'nonce',
        leasePath: path.join(storybookRoot, 'storybook-desktop.generated', 'application-lease.windows.json'),
        windowTitle: 'Agentic Components Storybook',
      },
      nativeDriver,
      schemaVersion: 2,
    });

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
      leasePath: path.join(storybookRoot, 'storybook-desktop.generated', 'application-lease.macos.json'),
    });
  });

  test('removes a stale application lease before writing a new manifest', () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-driver-manifest-'));
    try {
      const config = makeDesktopStorybookConfig({
        projectRoot: storybookRoot,
      });
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
      fs.mkdirSync(path.dirname(manifest.application.leasePath), { recursive: true });
      fs.writeFileSync(manifest.application.leasePath, '{}');
      const outputPath = path.join(temporaryDirectory, 'driver-manifest.json');

      writeDesktopStorybookDriverManifest(manifest, outputPath);

      expect(fs.existsSync(manifest.application.leasePath)).toBe(false);
      expect(JSON.parse(fs.readFileSync(outputPath, 'utf8'))).toMatchObject({ schemaVersion: 2 });
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

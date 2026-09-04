import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { DesktopStoryManifest, NativeDesktopApplicationDescriptor, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { DesktopStorybookInstance } from '../config/instance.js';
import type { Platforms } from '../config/platforms.js';

export type DesktopStorybookDriverManifest = {
  application: NativeDesktopApplicationDescriptor & {
    leaseNonce: string;
    leasePath: string;
  };
  appName: string;
  bridgeNonce: string;
  displayName: string;
  driverPort: number;
  endpoint: Platforms;
  instanceId: string;
  metroPort: number;
  nativeDriver: NativeDriverArtifact;
  platformManifestDigest: string;
  portablePlanDigest: string;
  renderer: 'fabric' | 'paper';
  schemaVersion: 2;
  storyManifest: DesktopStoryManifest;
  storybookPort: number;
  targetId: string;
  testIDPrefix: string;
};

export type CreateDesktopStorybookDriverManifestOptions = {
  bridgeNonce?: string;
  config: DesktopStorybookConfig;
  instance: DesktopStorybookInstance;
  nativeDriver: NativeDriverArtifact;
  platform: Platforms;
  storyManifest: DesktopStoryManifest;
};

export function createDesktopStorybookDriverManifest({
  bridgeNonce = randomBytes(24).toString('base64url'),
  config,
  instance,
  nativeDriver,
  platform,
  storyManifest,
}: CreateDesktopStorybookDriverManifestOptions): DesktopStorybookDriverManifest {
  const nativeOptions = config.getNativeDriverOptions(platform);
  if (nativeOptions === false) {
    throw new Error(`Native Desktop Driver is disabled for ${platform}.`);
  }
  const leasePath = path.join(config.projectRoot, 'storybook-desktop.generated', `application-lease.${platform}.json`);
  return Object.freeze({
    application: Object.freeze({
      ...nativeOptions.application,
      ...(platform === 'macos' ? { bundleIdentifier: instance.bundleIdentifier } : {}),
      leaseNonce: bridgeNonce,
      leasePath,
    }),
    appName: config.appName,
    bridgeNonce,
    displayName: config.displayName,
    driverPort: instance.driverPort,
    endpoint: platform,
    instanceId: instance.id,
    metroPort: instance.metroPort,
    nativeDriver,
    platformManifestDigest: storyManifest.platformManifestDigest,
    portablePlanDigest: storyManifest.portablePlanDigest,
    renderer: platform === 'win32' ? 'paper' : 'fabric',
    schemaVersion: 2,
    storyManifest,
    storybookPort: instance.storybookPort,
    targetId: `${config.appName}-${platform}`.toLowerCase(),
    testIDPrefix: config.testIDPrefix,
  });
}

export function writeDesktopStorybookDriverManifest(manifest: DesktopStorybookDriverManifest, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.rmSync(manifest.application.leasePath, { force: true });
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== content) {
    fs.writeFileSync(outputPath, content);
  }
}

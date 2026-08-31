import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { DesktopStorybookInstance } from '../config/instance.js';
import type { Platforms } from '../config/platforms.js';

export type DesktopStorybookDriverManifest = {
  appName: string;
  bridgeNonce: string;
  displayName: string;
  driverPort: number;
  endpoint: Platforms;
  instanceId: string;
  metroPort: number;
  platformManifestDigest: string;
  portablePlanDigest: string;
  renderer: 'fabric' | 'paper';
  schemaVersion: 1;
  storyManifest: DesktopStoryManifest;
  storybookPort: number;
  targetId: string;
  testIDPrefix: string;
};

export type CreateDesktopStorybookDriverManifestOptions = {
  bridgeNonce?: string;
  config: DesktopStorybookConfig;
  instance: DesktopStorybookInstance;
  platform: Platforms;
  storyManifest: DesktopStoryManifest;
};

export function createDesktopStorybookDriverManifest({
  bridgeNonce = randomBytes(24).toString('base64url'),
  config,
  instance,
  platform,
  storyManifest,
}: CreateDesktopStorybookDriverManifestOptions): DesktopStorybookDriverManifest {
  return Object.freeze({
    appName: config.appName,
    bridgeNonce,
    displayName: config.displayName,
    driverPort: instance.driverPort,
    endpoint: platform,
    instanceId: instance.id,
    metroPort: instance.metroPort,
    platformManifestDigest: storyManifest.platformManifestDigest,
    portablePlanDigest: storyManifest.portablePlanDigest,
    renderer: platform === 'win32' ? 'paper' : 'fabric',
    schemaVersion: 1,
    storyManifest,
    storybookPort: instance.storybookPort,
    targetId: `${config.appName}-${platform}`.toLowerCase(),
    testIDPrefix: config.testIDPrefix,
  });
}

export function writeDesktopStorybookDriverManifest(manifest: DesktopStorybookDriverManifest, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== content) {
    fs.writeFileSync(outputPath, content);
  }
}

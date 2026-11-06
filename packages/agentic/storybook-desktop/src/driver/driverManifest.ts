import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { DesktopStoryManifest, NativeDesktopApplicationDescriptor, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { selectDesktopRenderer } from '@fluentui-react-native/desktop-test/config';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { DesktopStorybookInstance } from '../config/instance.js';
import type { Platforms } from '../config/platforms.js';
import type { DesktopStorybookWdioOptions } from '../config/wdio.js';

/** Asks the channel service to protect its driver with a grant authority and publish one agent's connection. */
export type DesktopStorybookAgentManifest = {
  /** The connection descriptor's record name, which the adapter reads with `--descriptor`. */
  descriptor: string;
  /** Where the channel service records that the descriptor is published; the driver command waits for it. */
  readyPath: string;
  /** The private storage root, which the adapter reads with `--root`. Defaults to the platform location. */
  root?: string;
  /**
   * The identity an agent's attach session verifies instead of the application lease. Windows and Win32 have no lease
   * maintainer, so the driver resolves the exact window title qualified by the app's AUMID or canonical executable.
   */
  application?: NativeDesktopApplicationDescriptor;
};

export type DesktopStorybookDriverManifest = {
  agent?: DesktopStorybookAgentManifest;
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
  wdio?: DesktopStorybookWdioOptions;
};

export type CreateDesktopStorybookDriverManifestOptions = {
  agent?: Omit<DesktopStorybookAgentManifest, 'readyPath'>;
  bridgeNonce?: string;
  config: DesktopStorybookConfig;
  instance: DesktopStorybookInstance;
  nativeDriver: NativeDriverArtifact;
  platform: Platforms;
  renderer?: DesktopStorybookDriverManifest['renderer'];
  storyManifest: DesktopStoryManifest;
  wdio?: DesktopStorybookWdioOptions;
};

/** Returns the WebDriver target ID the embedded Storybook driver registers for an endpoint and renderer. */
export function desktopStorybookTargetId(
  config: Pick<DesktopStorybookConfig, 'appName' | 'getDesktopTarget'>,
  platform: Platforms,
  renderer: DesktopStorybookDriverManifest['renderer'],
): string {
  const configuredTarget = config.getDesktopTarget?.(platform);
  const target = configuredTarget && platform === 'macos' ? selectDesktopRenderer(configuredTarget, renderer) : configuredTarget;
  return target?.id ?? `${config.appName}-${platform}`.toLowerCase();
}

export function createDesktopStorybookDriverManifest({
  agent,
  bridgeNonce = randomBytes(24).toString('base64url'),
  config,
  instance,
  nativeDriver,
  platform,
  renderer = platform === 'win32' ? 'paper' : 'fabric',
  storyManifest,
  wdio,
}: CreateDesktopStorybookDriverManifestOptions): DesktopStorybookDriverManifest {
  const nativeOptions = config.getNativeDriverOptions(platform);
  if (nativeOptions === false) {
    throw new Error(`Native Desktop Driver is disabled for ${platform}.`);
  }
  const generated = path.join(config.projectRoot, 'storybook-desktop.generated');
  const leasePath = path.join(generated, `application-lease.${platform}.json`);
  return Object.freeze({
    ...(agent
      ? {
          agent: Object.freeze({
            descriptor: agent.descriptor,
            readyPath: path.join(generated, `agent-ready.${platform}.json`),
            ...(agent.root === undefined ? {} : { root: agent.root }),
            ...(agent.application === undefined ? {} : { application: Object.freeze({ ...agent.application }) }),
          }),
        }
      : {}),
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
    renderer,
    schemaVersion: 2,
    storyManifest,
    storybookPort: instance.storybookPort,
    targetId: desktopStorybookTargetId(config, platform, renderer),
    testIDPrefix: config.testIDPrefix,
    wdio: wdio ?? config.wdio,
  });
}

export function writeDesktopStorybookDriverManifest(manifest: DesktopStorybookDriverManifest, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.rmSync(manifest.application.leasePath, { force: true });
  if (manifest.agent) fs.rmSync(manifest.agent.readyPath, { force: true });
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== content) {
    fs.writeFileSync(outputPath, content);
  }
}

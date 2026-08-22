/**
 * Embedded platform-driver discovery and installation verification.
 *
 * Platform drivers are runtime dependencies of this package. "Install" is therefore an
 * idempotent verification step: it confirms the embedded package and the non-downloadable host
 * requirements instead of mutating an Appium home that the single-driver host never uses.
 */

import { DesktopDriverError } from './errors.ts';
import { checkMacosPrerequisites } from './platforms/macos.ts';
import { checkWindowsPrerequisites } from './platforms/windows.ts';
import type { DesktopBackendId, DesktopPlatform, DesktopPrerequisiteStatus } from './types.ts';

interface DriverDefinition {
  backend: DesktopBackendId;
  packageName?: string;
  blockingPrerequisites: readonly string[];
  installMessage: string;
}

const DRIVER_DEFINITIONS: Readonly<Record<DesktopPlatform, DriverDefinition>> = {
  macos: {
    backend: 'mac2',
    packageName: 'appium-mac2-driver',
    blockingPrerequisites: ['macos-version', 'xcode'],
    installMessage: 'Mac2 is bundled; WebDriverAgentMac is built and cached when the first session starts.',
  },
  windows: {
    backend: 'novawindows',
    packageName: 'appium-novawindows-driver',
    blockingPrerequisites: ['windows-version', 'powershell'],
    installMessage: 'NovaWindows is bundled and uses Windows PowerShell directly; no native driver service is installed.',
  },
  fake: {
    backend: 'fake',
    blockingPrerequisites: [],
    installMessage: 'The fake backend is built into the package.',
  },
};

export type DesktopDriverDetectionStatus = 'ready' | 'missing' | 'unknown' | 'unsupported';

export interface DesktopDriverDetection {
  platform: DesktopPlatform;
  backend: DesktopBackendId;
  packageName?: string;
  packageVersion?: string;
  status: DesktopDriverDetectionStatus;
  prerequisites: readonly DesktopPrerequisiteStatus[];
  detail: string;
}

export interface DesktopDriverInstallResult {
  changed: false;
  driver: DesktopDriverDetection;
  message: string;
}

interface DriverDetectionOptions {
  hostPlatform?: NodeJS.Platform;
  resolvePackageVersion?: (packageName: string) => string | undefined | Promise<string | undefined>;
  loadPackage?: (packageName: string) => unknown | Promise<unknown>;
  prerequisites?: readonly DesktopPrerequisiteStatus[];
}

/** Maps the current Node host to the desktop platform it can run. */
export function detectHostPlatform(hostPlatform: NodeJS.Platform = process.platform): DesktopPlatform {
  if (hostPlatform === 'darwin') {
    return 'macos';
  }
  if (hostPlatform === 'win32') {
    return 'windows';
  }
  return 'fake';
}

/** Whether a prerequisite must pass before the embedded driver can be considered ready. */
export function isBlockingDriverPrerequisite(platform: DesktopPlatform, prerequisiteId: string): boolean {
  return DRIVER_DEFINITIONS[platform].blockingPrerequisites.includes(prerequisiteId);
}

/** Resolves the installed version of an embedded driver package without executing it. */
export async function resolveDriverPackageVersion(packageName: string): Promise<string | undefined> {
  try {
    const module = (await import(`${packageName}/package.json`, { with: { type: 'json' } })) as {
      default?: { name?: string; version?: string };
    };
    return module.default?.name === packageName ? module.default.version : undefined;
  } catch {
    return undefined;
  }
}

/** Detects the embedded backend and the host requirements needed to start it. */
export async function detectDesktopDriver(
  platform: DesktopPlatform = detectHostPlatform(),
  options: DriverDetectionOptions = {},
): Promise<DesktopDriverDetection> {
  const definition = DRIVER_DEFINITIONS[platform];
  const hostPlatform = detectHostPlatform(options.hostPlatform);
  const packageVersion = definition.packageName
    ? await (options.resolvePackageVersion ?? resolveDriverPackageVersion)(definition.packageName)
    : undefined;
  let loadError: unknown;
  if (definition.packageName && packageVersion && platform === hostPlatform) {
    try {
      await (options.loadPackage ?? ((packageName: string) => import(packageName)))(definition.packageName);
    } catch (error) {
      loadError = error;
    }
  }
  const prerequisites =
    options.prerequisites ??
    (platform === 'macos'
      ? checkMacosPrerequisites(options.hostPlatform)
      : platform === 'windows'
        ? checkWindowsPrerequisites(process.env, options.hostPlatform)
        : []);
  const blockers = prerequisites.filter((entry) => definition.blockingPrerequisites.includes(entry.id));

  let status: DesktopDriverDetectionStatus;
  let detail: string;
  if (platform !== 'fake' && platform !== hostPlatform) {
    status = 'unsupported';
    detail = `The ${platform} driver cannot run on ${options.hostPlatform ?? process.platform}.`;
  } else if (definition.packageName && !packageVersion) {
    status = 'missing';
    detail = `The required runtime dependency "${definition.packageName}" is missing. Reinstall this package with its dependencies.`;
  } else if (loadError) {
    status = 'missing';
    detail = `The embedded driver "${definition.packageName}" could not load: ${loadError instanceof Error ? loadError.message : String(loadError)}`;
  } else if (blockers.some((entry) => entry.status === 'missing')) {
    status = 'missing';
    detail = `Required host prerequisites are missing: ${blockers
      .filter((entry) => entry.status === 'missing')
      .map((entry) => entry.id)
      .join(', ')}.`;
  } else if (blockers.some((entry) => entry.status === 'unknown')) {
    status = 'unknown';
    detail = `Required host prerequisites could not be verified: ${blockers
      .filter((entry) => entry.status === 'unknown')
      .map((entry) => entry.id)
      .join(', ')}.`;
  } else {
    status = 'ready';
    detail = definition.installMessage;
  }

  return {
    platform,
    backend: definition.backend,
    packageName: definition.packageName,
    packageVersion,
    status,
    prerequisites,
    detail,
  };
}

/**
 * Installs the selected driver.
 *
 * Driver packages are already dependencies, NovaWindows has no external service to install, and
 * Mac2 builds WebDriverAgentMac on demand. This command validates that complete setup and fails
 * with the exact missing host requirement rather than changing package-manager or Appium state.
 */
export async function installDesktopDriver(
  platform: DesktopPlatform = detectHostPlatform(),
  options: DriverDetectionOptions = {},
): Promise<DesktopDriverInstallResult> {
  const driver = await detectDesktopDriver(platform, options);
  if (driver.status !== 'ready') {
    throw new DesktopDriverError(`Cannot install the ${driver.backend} driver: ${driver.detail}`, {
      kind: 'driverHost',
      detail: { driver },
    });
  }
  return { changed: false, driver, message: DRIVER_DEFINITIONS[platform].installMessage };
}

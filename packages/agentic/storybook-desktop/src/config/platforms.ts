import os from 'node:os';
import path from 'node:path';
import type { AllPlatforms } from '@rnx-kit/tools-react-native/platform';
import { getAvailablePlatforms } from '@rnx-kit/tools-react-native/platform';

export type Platforms = Extract<AllPlatforms, 'macos' | 'windows' | 'win32'>;

export const FURN_STORYBOOK_PLATFORM = 'FURN_STORYBOOK_PLATFORM';

const supportedPlatforms = ['macos', 'windows', 'win32'] as const satisfies readonly Platforms[];
const platformCache = new Map<string, readonly Platforms[]>();

export function getAllPlatforms(projectRoot = process.cwd()): readonly Platforms[] {
  const resolvedRoot = path.resolve(projectRoot);
  let platforms = platformCache.get(resolvedRoot);
  if (!platforms) {
    platforms = Object.freeze(Object.keys(getAvailablePlatforms(resolvedRoot)).filter(isPlatform));
    platformCache.set(resolvedRoot, platforms);
  }
  return platforms;
}

const defaultPlatform = os.platform() === 'win32' ? 'windows' : os.platform() === 'darwin' ? 'macos' : undefined;

export function isPlatform(setting: string): setting is Platforms {
  return supportedPlatforms.includes(setting as Platforms);
}

function parsePlatform(setting: string | AllPlatforms, source: string): Platforms {
  if (!isPlatform(setting)) {
    throw new RangeError(`${source} must be one of: ${supportedPlatforms.join(', ')}. Received "${setting}".`);
  }
  return setting;
}

export function getPlatform(setting?: string | AllPlatforms): Platforms | undefined {
  if (setting) {
    return parsePlatform(setting, 'Desktop Storybook platform');
  }

  const environmentPlatform = process.env[FURN_STORYBOOK_PLATFORM];
  return environmentPlatform ? parsePlatform(environmentPlatform, FURN_STORYBOOK_PLATFORM) : defaultPlatform;
}

export function setPlatform(platform: Platforms): void {
  process.env[FURN_STORYBOOK_PLATFORM] = parsePlatform(platform, 'Desktop Storybook platform');
}

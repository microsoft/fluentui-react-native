import type { PackageManifest as ManifestBase } from '@rnx-kit/types-node';

export const JEST_PLATFORMS = ['react', 'ios', 'android', 'windows', 'macos', 'win32'] as const;
export type JestPlatform = (typeof JEST_PLATFORMS)[number];

export type FurnManifestConfig = {
  jestPlatform?: JestPlatform;
  packageType?: 'tooling' | 'library' | 'app';
  depcheck?: {
    ignoreMatches?: string[];
    ignorePatterns?: string[];
  };
};

export type PackageManifest = ManifestBase & {
  furn?: FurnManifestConfig;
};

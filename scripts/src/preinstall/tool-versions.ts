import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PackageManifest } from '../utils/projectRoot.ts';

/**
 * Get the package.json manifest for a given folder.
 */
function getPackageManifest(folder: string): PackageManifest {
  const manifestPath = path.join(folder, 'package.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// Get the versions once, so we don't query again on each package
const scriptFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scriptManifest = getPackageManifest(scriptFolder);
const rootManifest = getPackageManifest(path.dirname(scriptFolder));

const devToolVersions: Record<string, string> = {
  '@eslint/js': '^9.0.0',
  '@microsoft/eslint-plugin-sdl': '^1.1.0',
  '@react-native-community/cli': '^13.6.4',
  '@react-native-community/cli-platform-android': '^13.6.4',
  '@react-native-community/cli-platform-ios': '^13.6.4',
  '@rnx-kit/eslint-plugin': '^0.8.6',
  '@rnx-kit/oxlint-config': '^1.0.3',
  '@rnx-kit/jest-preset': '^0.2.1',
  '@rnx-kit/tools-packages': '^0.1.1',
  '@rnx-kit/tools-typescript': '^0.1.1',
  '@rnx-kit/tsconfig': '^2.1.1',
  '@types/es6-collections': '^0.5.29',
  '@types/es6-promise': '0.0.32',
  '@types/jest': '^29.0.0',
  '@types/node': '^22.0.0',
  '@types/react-test-renderer': '16.9.0',
  '@typescript-eslint/eslint-plugin': '^8.36.0',
  '@typescript-eslint/parser': '^8.36.0',
  '@uifabric/prettier-rules': '^7.0.3',
  clipanion: '^4.0.0-rc.4',
  depcheck: '^1.0.0',
  'find-up': '^5.0.0',
  'fs-extra': '^7.0.1',
  glob: '^10.0.0',
  jest: '^29.2.1',
  'jest-diff': '^27.0.0',
  jsdom: '^25.0.0',
  'metro-config': '^0.80.3',
  'metro-react-native-babel-transformer': '^0.76.5',
  oxlint: '^1.57.0',
  'oxlint-tsgolint': '^0.17.4',
  'react-test-renderer': '18.2.0',
  rimraf: '^5.0.1',
  // Fill versions from scripts first
  ...scriptManifest.devDependencies,
  // use the root workspace dev dependencies as the highest priority, overwriting any duplicates from scripts
  ...rootManifest.devDependencies,
};

const workspaceToolVersions: Record<string, string> = {
  '@fluentui-react-native/babel-config': 'workspace:*',
  '@fluentui-react-native/jest-config': 'workspace:*',
  '@fluentui-react-native/scripts': 'workspace:*',
};

export function getToolVersion(packageName: string): string | null {
  return devToolVersions[packageName] ?? workspaceToolVersions[packageName] ?? null;
}

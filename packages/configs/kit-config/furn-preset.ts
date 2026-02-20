const { presets } = require('@rnx-kit/align-deps');
import type { Package as BasePackage, MetaPackage } from '@rnx-kit/align-deps';

type BaseCapability = NonNullable<BasePackage['capabilities']>[number];

/** Capability extended with our custom types */
type Capability =
  | BaseCapability
  | 'react-types'
  | 'core-win32'
  | 'react-test-renderer-types'
  | 'core-dev-only'
  | 'core-windows-dev-only'
  | 'tools-core'
  | 'tools-eslint'
  | 'tools-jest'
  | 'tools-babel'
  | 'babel-core'
  | 'tools-react-configs'
  | 'tools-jest-react';

type Package = Omit<BasePackage, 'capabilities'> & {
  capabilities?: Capability[];
};

type VersionPreset = Readonly<Record<Capability, MetaPackage | Package>>;
type Preset = Record<string, VersionPreset>;

/** Helper to remove readonly */
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Grab the presets from rnx-kit and modify them for Furn's use
 */
const rnPresets: Preset = presets['microsoft/react-native'];

/**
 * In FURN, there are places where we want to use react-native for testing purposes, but the libraries
 * itself should not depend on react-native. Therefore, we create dev-only capabilities for each core
 * capability in the preset. These dev-only capabilities will reference other dev-only capabilities so
 * 'core-windows-dev-only' will depend on 'core-dev-only', etc.
 *
 * @param cap base capability to turn into a dev capability
 * @returns the dev capability string as a Capability type
 */
function toDevCapability(cap: Capability): Capability {
  if (cap.startsWith('core') && !cap.endsWith('-dev-only') && !cap.startsWith('core/')) {
    return `${cap}-dev-only` as Capability;
  }
  return cap;
}

/**
 * Form the FURN preset for the given RN by doing a few notable transformations:
 * 1. Add dev-only packages for each core package
 * 2. Modify 'core' to only include 'react', skipping metro-config and community/cli
 *    - for react-native libraries these don't need metro or CLI as dependencies, this is really app only
 * 3. Modify 'react' package to additionally include the 'react-types' capability
 * 4. Add 'react-test-renderer-types' capability to 'react-test-renderer' package
 * 5. Add 'core-win32' package for Win32 support
 * 6. Add 'react-test-renderer-types' package for test renderer types
 * 7. Add tools packages for eslint, jest, and core scripts
 * @param rnPreset base preset from rnx-kit to modify
 * @param _version version number of RN, so 74, 78, etc.
 * @returns the modified FURN preset for this particular version
 */
function formFurnPreset(rnPreset: VersionPreset, _version: number): VersionPreset {
  const presetCore = rnPreset['core'] as Package;
  const presetReact = rnPreset['react'] as Package;
  const presetReactTestRenderer = rnPreset['react-test-renderer'] as Package;
  const presetWindows = rnPreset['core-windows'] as Package;

  // create the new version of the preset
  const newPreset: Mutable<VersionPreset> = {
    ...rnPreset,
    core: { ...presetCore, capabilities: ['react'] },
    react: { ...presetReact, capabilities: ['react-types'] },
    'react-test-renderer': {
      ...presetReactTestRenderer,
      capabilities: ['react', 'react-test-renderer-types'],
    },
    'react-types': {
      name: '@types/react',
      version: `~${presetReact.version}`,
    },
    'react-test-renderer-types': {
      name: '@types/react-test-renderer',
      version: `^${presetReactTestRenderer.version}`,
      devOnly: true,
    },
    'core-win32': {
      name: '@office-iss/react-native-win32',
      version: presetWindows.version,
      capabilities: ['core'],
    },
    'tools-babel': {
      name: '@fluentui-react-native/babel-config',
      version: `workspace:*`,
      devOnly: true,
      capabilities: ['babel-preset-react-native', 'babel-core'],
    },
    'tools-react-configs': {
      name: '@fluentui-react-native/react-configs',
      version: `workspace:*`,
      devOnly: true,
      capabilities: ['babel-core'],
    },
    'tools-core': {
      name: '@fluentui-react-native/scripts',
      version: 'workspace:*',
      devOnly: true,
    },
    'tools-eslint': {
      name: '@fluentui-react-native/eslint-config-rules',
      version: 'workspace:*',
      devOnly: true,
      capabilities: ['tools-core'],
    },
    'tools-jest': {
      name: '@fluentui-react-native/jest-config',
      version: 'workspace:*',
      devOnly: true,
      capabilities: ['tools-core', 'tools-babel'],
    },
    'tools-jest-react': {
      name: '@fluentui-react-native/react-configs',
      version: 'workspace:*',
      devOnly: true,
      capabilities: ['tools-core', 'babel-core'],
    },
    'babel-core': {
      name: '@babel/core',
      version: 'catalog:',
      devOnly: true,
    },
  };

  // now add the dev capabilities and link to catalogs
  for (const cap of Object.keys(newPreset)) {
    const pkgEntry = newPreset[cap as Capability] as Package;
    if (pkgEntry) {
      // add dev-only capability if this is a core capability
      const devCap = toDevCapability(cap as Capability);
      if (cap !== devCap && !pkgEntry.devOnly) {
        const entryCapabilities = pkgEntry.capabilities;
        const capabilities = entryCapabilities?.map((c) => toDevCapability(c));
        newPreset[devCap] = {
          ...pkgEntry,
          devOnly: true,
          capabilities,
        };
      }
    }
  }
  return newPreset;
}

module.exports = {
  '0.73': formFurnPreset(rnPresets['0.73'], 73),
  '0.74': formFurnPreset(rnPresets['0.74'], 74),
  '0.78': formFurnPreset(rnPresets['0.78'], 78),
  '0.81': formFurnPreset(rnPresets['0.81'], 81),
};

// use require because this is directly invoked via rnx-kit.config.cjs and needs to be CommonJS
import { presets } from '@rnx-kit/align-deps';
// type imports are stripped so can use ESM style imports
import type { Package as RNXPackage, MetaPackage } from '@rnx-kit/align-deps';

/**
 * Types to make working with align-deps presets easier
 */

/** Create our custom capability type */
type RNXCapability = NonNullable<RNXPackage['capabilities']>[number];
type Capability =
  | RNXCapability
  | 'core-win32'
  | 'core-win32-dev-only'
  | 'core-dev-only'
  | 'core-windows-dev-only'
  | 'core-android-dev-only'
  | 'core-ios-dev-only'
  | 'core-macos-dev-only'
  | 'react-types'
  | 'react-test-renderer-types'
  | 'babel-preset-react-native'
  | 'babel-core'
  | 'tools-babel'
  | 'tools-eslint'
  | 'tools-jest'
  | 'tools-jest-react'
  | 'tools-core'
  | 'tools-react-configs';

/** Remove the hard Capability type from Package as we are adding custom capabilities */
type Package = Omit<RNXPackage, 'capabilities'> & {
  capabilities?: Capability[];
};

/** Defined type for a specific version */
type VersionPreset = Readonly<Record<Capability, MetaPackage | Package>>;
/** Presets as a whole */
type Preset = Record<string, VersionPreset>;
/** Create our custom capability type */
/** Helper to remove readonly */
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Grab the presets from rnx-kit and modify them for Furn's use
 */
const rnPresets = presets['microsoft/react-native'] as Preset;

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
  const presetWindows = rnPreset['core-windows'] as Package;
  const presetReactTestRenderer = rnPreset['react-test-renderer'] as Package;

  // create the new version of the preset
  const newPreset: Mutable<VersionPreset> = {
    ...rnPreset,
    core: { ...presetCore, capabilities: ['react'] },
    react: { ...presetReact, capabilities: ['react-types'] },
    'react-test-renderer': {
      ...presetReactTestRenderer,
      version: presetReact.version,
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
    'babel-core': {
      name: '@babel/core',
      version: 'catalog:',
      devOnly: true,
    },
  };

  // now add the dev capabilities and link to catalogs
  for (const capString of Object.keys(newPreset)) {
    const cap = capString as Capability;
    const pkgEntry = newPreset[cap] as Package;
    if (pkgEntry) {
      // patch metro/metro-core/etc packages to not allow progressing beyond 83.1 because
      // of serializer incompatibility
      if (cap.startsWith('metro') && pkgEntry.version.startsWith('^83.1')) {
        pkgEntry.version = pkgEntry.version.replace('^83.1', '83.1');
      }
      // add dev-only capability if this is a core capability
      const devCap = toDevCapability(cap);
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

export default {
  '0.73': formFurnPreset(rnPresets['0.73'], 73),
  '0.74': formFurnPreset(rnPresets['0.74'], 74),
  '0.78': formFurnPreset(rnPresets['0.78'], 78),
  '0.81': formFurnPreset(rnPresets['0.81'], 81),
};

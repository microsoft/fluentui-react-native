const { presets } = require('@rnx-kit/align-deps');
import type { Preset, Package } from '@rnx-kit/align-deps';

type VersionPreset = Preset[string];
type Capability = NonNullable<Package['capabilities']>[number];
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const rnPresets: Preset = presets['microsoft/react-native'];

function toDevCapability(cap: Capability): Capability {
  if (cap.startsWith('core')) {
    return `${cap}-dev-only` as Capability;
  }
  return cap;
}

function formFurnPreset(rnPreset: VersionPreset): VersionPreset {
  const presetCore = rnPreset['core'] as Package;
  const newPreset: Mutable<VersionPreset> = {
    ...rnPreset,
    core: { ...presetCore, capabilities: ['react'] },
    'core-win32': {
      name: '@office-iss/react-native-win32',
      version: presetCore.version,
      capabilities: ['core'],
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
      capabilities: ['tools-core'],
    },
  };
  for (const cap of Object.keys(newPreset)) {
    const devCap = toDevCapability(cap);
    const pkgEntry = newPreset[cap] as Package;
    if (cap !== devCap && pkgEntry && !pkgEntry.devOnly) {
      const entryCapabilities = pkgEntry.capabilities;
      const capabilities = entryCapabilities?.map((c) => toDevCapability(c));
      newPreset[devCap] = {
        ...pkgEntry,
        devOnly: true,
        capabilities,
      };
    }
  }
  return newPreset;
}

module.exports = {
  0.73: formFurnPreset(rnPresets['0.73']),
  0.74: formFurnPreset(rnPresets['0.74']),
};

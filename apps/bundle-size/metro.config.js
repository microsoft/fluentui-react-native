const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

const symlinkResolver = MetroSymlinksResolver({
  resolver: 'oxc-resolver',
});

function resolvePlatformModule(moduleName, platform) {
  if (platform !== 'win32') {
    return moduleName;
  }

  if (moduleName === 'react-native') {
    return '@office-iss/react-native-win32';
  }

  if (moduleName.startsWith('react-native/')) {
    return `@office-iss/react-native-win32/${moduleName.slice('react-native/'.length)}`;
  }

  return moduleName;
}

module.exports = makeMetroConfig({
  resolver: {
    resolveRequest: (context, moduleName, platform) => symlinkResolver(context, resolvePlatformModule(moduleName, platform), platform),
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native', 'import', 'require'],
    disableHierarchicalLookup: true,
    enableSymlinks: true,
  },
});

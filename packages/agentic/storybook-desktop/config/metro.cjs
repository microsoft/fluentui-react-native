const path = require('node:path');
const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const safeAreaStub = path.resolve(__dirname, 'react-native-safe-area-context.cjs');

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

function createDesktopStorybookMetroConfig({ configPath }) {
  if (!configPath) {
    throw new TypeError('createDesktopStorybookMetroConfig requires an app-owned Storybook configPath.');
  }

  const symlinkResolver = MetroSymlinksResolver({
    resolver: 'oxc-resolver',
  });
  const config = makeMetroConfig({
    resolver: {
      resolveRequest: (context, moduleName, platform) => {
        // Storybook's path-based lite-mode mock does not recognize Yarn's virtual pnpm paths.
        if (moduleName === '@storybook/react-native-ui' || moduleName.startsWith('@storybook/react-native-ui/')) {
          return { type: 'empty' };
        }
        if (moduleName === 'react-native-safe-area-context') {
          return { type: 'sourceFile', filePath: safeAreaStub };
        }
        return symlinkResolver(context, resolvePlatformModule(moduleName, platform), platform);
      },
      unstable_enablePackageExports: true,
      unstable_conditionNames: ['react-native', 'import', 'require'],
      disableHierarchicalLookup: true,
      enableSymlinks: true,
    },
    transformer: {
      unstable_allowRequireContext: true,
    },
  });

  return withStorybook(config, {
    configPath,
    liteMode: true,
  });
}

module.exports = {
  createDesktopStorybookMetroConfig,
};

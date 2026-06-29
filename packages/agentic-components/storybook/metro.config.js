const path = require('node:path');
const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { withStorybook } = require('@storybook/react-native/withStorybook');

// The library source (which contains the *.stories.* files) lives one level up from this
// app, so Metro needs to watch the whole package directory in addition to the repo root.
const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');

const symlinkResolver = MetroSymlinksResolver({
  resolver: 'oxc-resolver',
});

// JS-only replacement for react-native-safe-area-context (its native module does not build for
// react-native-macos 0.81 — see the stub file for details).
const safeAreaStub = path.resolve(__dirname, './src/storybook-mocks/react-native-safe-area-context.js');

const config = makeMetroConfig({
  projectRoot: __dirname,
  watchFolders: [packageRoot, repoRoot],
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      // Storybook liteMode mocks out the heavy default UI (`@storybook/react-native-ui`, which
      // pulls reanimated/gesture-handler/bottom-sheet/svg). withStorybook does this by checking
      // the resolved file path for "@storybook/react-native-ui", but under the Yarn pnpm linker
      // resolved paths use ".store/@storybook-react-native-ui-virtual-*" (dashes), so that check
      // never matches. Mock it here by import specifier instead. The trailing `/` / exact-match
      // guard avoids also mocking `-ui-lite` and `-ui-common`.
      if (moduleName === '@storybook/react-native-ui' || moduleName.startsWith('@storybook/react-native-ui/')) {
        return { type: 'empty' };
      }
      // Redirect react-native-safe-area-context to a JS-only stub (no incompatible native module).
      if (moduleName === 'react-native-safe-area-context') {
        return { type: 'sourceFile', filePath: safeAreaStub };
      }
      return symlinkResolver(context, moduleName, platform);
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

module.exports = withStorybook(config, {
  configPath: path.resolve(__dirname, '.rnstorybook'),
  // Lite mode mocks out the heavy default Storybook UI so we don't need react-native-reanimated,
  // react-native-gesture-handler, @gorhom/bottom-sheet or react-native-svg.
  liteMode: true,
});

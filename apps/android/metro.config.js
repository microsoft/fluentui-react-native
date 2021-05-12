/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getWatchFolders} = require('@uifabricshared/build-native');
const {
  TypeScriptValidation,
} = require('@rnx-kit/metro-plugin-typescript-validation');
const {MetroSerializer} = require('@rnx-kit/metro-serializer');

module.exports = {
  watchFolders: getWatchFolders(),
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  serializer: {
    customSerializer: MetroSerializer([TypeScriptValidation()]),
  },
};

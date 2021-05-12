/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { TypeScriptValidation } = require('@rnx-kit/metro-plugin-typescript-validation');
const { MetroSerializer } = require('@rnx-kit/metro-serializer');

module.exports = {
  serializer: {
    customSerializer: MetroSerializer([TypeScriptValidation()]),
  },
};

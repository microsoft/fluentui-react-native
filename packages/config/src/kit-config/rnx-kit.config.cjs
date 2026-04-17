/** @type {import('@rnx-kit/types-kit-config').KitConfig} */
const config = {
  kitType: 'library',
  alignDeps: {
    presets: ['@fluentui-react-native/config/align-deps-preset'],
    requirements: {
      development: ['react-native@0.81'],
      production: ['react-native@0.73 || 0.74 || 0.78 || 0.81'],
    },
  },
};

module.exports = config;

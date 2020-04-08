module.exports = {
  preset: require('./just.config'),
  just: require('just-scripts'),
  eslintPreset: require('./eslintrc'),
  ...require('@fluentui-react-native/build-tools')
};

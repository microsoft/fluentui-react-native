module.exports = {
  preset: require('./lib/justPreset'),
  just: require('just-scripts'),
  eslintPreset: require('./lib/eslintrc'),
  ...require('@fluentui-react-native/build-tools'),
};

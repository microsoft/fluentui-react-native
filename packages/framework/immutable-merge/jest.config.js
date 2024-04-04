const { configureJest } = require('@fluentui-react-native/scripts');
module.exports = configureJest({
  // Jest is picking up the hoisted version of lru-cache, which is incompatible from the version
  // required by semver
  moduleNameMapper: {
    'lru-cache': require.resolve('lru-cache', {paths:[require.resolve('semver')]}),
  },
});
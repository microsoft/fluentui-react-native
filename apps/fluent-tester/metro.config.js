const { configureMetro } = require('@uifabricshared/build-native');
const config = configureMetro({
  bundle: 'fluentui-shared-tester',
  platform: 'windows'
});
module.exports = config;

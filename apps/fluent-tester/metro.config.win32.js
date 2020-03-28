// @ts-check

const { configureMetro } = require('@uifabricshared/build-native');
const config = configureMetro({
  bundle: 'fluentui-shared-tester',
  platform: 'win32'
});
module.exports = config;

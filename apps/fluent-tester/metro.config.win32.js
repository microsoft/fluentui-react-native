// @ts-check

const { configureMetro } = require('@uifabricshared/build-native');
module.exports = configureMetro({
  bundle: 'fluentui-shared-tester',
  platform: 'win32'
});

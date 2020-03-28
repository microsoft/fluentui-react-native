// @ts-check

const { configureMetro } = require('@uifabricshared/build-native');
const config = configureMetro({
  bundle: 'fluentui-shared-tester',
  platform: 'win32'
});
console.log(config);
module.exports = config;

/*
const { configureMetro } = require('@uifabricshared/build-native');
module.exports = configureMetro({
  bundle: 'fluentui-shared-tester',
  platform: 'win32'
});
*/

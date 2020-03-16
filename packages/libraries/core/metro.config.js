// @ts-check

const { configureMetro } = require('@uifabricshared/build-native');
module.exports = configureMetro({
  bundle: 'fluentui-react-native',
  platform: 'win32'
});

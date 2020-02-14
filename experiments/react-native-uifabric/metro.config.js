// @ts-check

const { configureMetro } = require('@uifabricshared/build-native');
module.exports = configureMetro({
  bundle: 'react-native-uifabric',
  platforms: 'win32'
});

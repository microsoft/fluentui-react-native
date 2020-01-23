// @ts-check

// const path = require('path');
// const a = require('just-scripts');
const Metro = require('metro');

exports.metroPack = async function() {
  const config = await Metro.loadConfig();

  await Metro.runBuild(config, {
    platform: 'win32',
    minify: true,
    out: 'react-native-uifabric.js'
  });
};

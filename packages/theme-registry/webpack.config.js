const { just } = require('@uifabric/build-native');
const { webpackConfig, webpackMerge } = just;

const BUNDLE_NAME = 'theme-registry';
const IS_PRODUCTION = process.argv.indexOf('--production') > -1;

module.exports = webpackMerge(webpackConfig, {
  entry: {
    [BUNDLE_NAME]: './lib/index.js'
  },
  output: {
    filename: `${BUNDLE_NAME}.js`
  }
});

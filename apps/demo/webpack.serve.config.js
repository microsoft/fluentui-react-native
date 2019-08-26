const path = require('path');
const { just } = require('@uifabric/build-native');
const { webpackMerge, htmlOverlay, webpackConfig } = just;

const BUNDLE_NAME = 'demo';

module.exports = webpackMerge(
  webpackConfig,
  htmlOverlay({
    template: './index.ejs'
  }),
  {
    entry: {
      [BUNDLE_NAME]: './src/index.tsx'
    },
    output: {
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
      filename: `${BUNDLE_NAME}.js`
    }
  }
);

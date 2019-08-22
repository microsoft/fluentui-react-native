const { just } = require('@uifabric/build-native');
const { webpackConfig, webpackMerge, htmlOverlay } = just;

const BUNDLE_NAME = 'demo';

module.exports = webpackMerge(
  webpackConfig,
  htmlOverlay({
    template: './index.ejs'
  }),
  {
    entry: {
      [BUNDLE_NAME]: './lib/index.js'
    },
    output: {
      filename: `${BUNDLE_NAME}.js`
    }
  }
);

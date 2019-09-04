const path = require('path');
const { just } = require('@uifabric/build-native');
const { webpackMerge, htmlOverlay, webpackServeConfig } = just;

const BUNDLE_NAME = 'demo';

module.exports = webpackMerge(
  webpackServeConfig,
  htmlOverlay({
    template: './index.ejs'
  }),
  {
    entry: {
      [BUNDLE_NAME]: './src/index.tsx'
    },
    devtool: 'inline-source-map',
    output: {
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
      filename: `${BUNDLE_NAME}.js`
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader'
          },
          exclude: [/node_modules/, /\.test.tsx?$/]
        },
        {
          test: /\.js?$/,
          use: "source-map-loader",
          enforce: 'pre'
        }
      ]
    },
  }
);

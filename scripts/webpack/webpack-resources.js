const { just } = require('@uifabric/build-native');
const { webpackConfig, htmlOverlay, webpackMerge } = just;

const _isProduction = process.argv.indexOf('--production') > -1;

module.exports = {
  createConfig(bundleName, additionalOptions) {
    return webpackMerge(
      webpackConfig,
      {
        entry: {
          [bundleName]: './src/index.ts'
        },
        devtool: 'inline-source-map',
        module: {
          rules: [
            {
              test: /\.js?$/,
              use: "source-map-loader",
              enforce: 'pre'
            }
          ]
        },
        output: {
          filename: `${bundleName}.js`
        },
        plugins: getPlugins(bundleName, _isProduction)
      },
      additionalOptions
    );
  },
  createAppConfig(bundleName, overlayTarget, additionalOptions) {
    return webpackMerge(
      webpackConfig,
      htmlOverlay({
        template: overlayTarget
      }),
      {
        entry: {
          [bundleName]: './src/index.tsx'
        },
        devtool: 'inline-source-map',
        output: {
          filename: `${bundleName}.js`
        },
        module: {
          rules: [
            {
              test: /\.js?$/,
              use: "source-map-loader",
              enforce: 'pre'
            }
          ]
        },
        plugins: getPlugins(bundleName, _isProduction)
      },
      additionalOptions
    );
  }
};

function getPlugins(bundleName, isProduction) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  const plugins = [];

  if (isProduction) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: bundleName + '.stats.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsOptions: {
          source: false,
          reasons: false,
          chunks: false
        },
        statsFilename: bundleName + '.stats.json',
        logLevel: 'warn'
      })
    );
  }

  return plugins;
}

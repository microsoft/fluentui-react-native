const { just } = require('@uifabricshared/build-native');
const {
  basicWebpackConfig,
  htmlOverlay,
  webpackMerge,
  tsOverlay,
  fileOverlay,
  displayBailoutOverlay,
  stylesOverlay,
} = just;

const _isProduction = process.argv.indexOf('--production') > -1;

// For API-Extractor to point you to source files rather than .d.ts files
// declarationMap must be set to true in the tsconfig.js, but tsloader can
// skip creation of declarationMaps.
const tsOverlayConfig = tsOverlay({
  loaderOptions: {
    transpileOnly: true,
    compilerOptions: {
      "declaration": false,
      "declarationMap": false
    }
  },
  checkerOptions: {
    transpileOnly: true,
    compilerOptions: {
      "declaration": false,
      "declarationMap": false
    }
  }
});

module.exports = {
  createConfig(bundleName, additionalOptions) {
    return webpackMerge(
      basicWebpackConfig,
      stylesOverlay(),
      tsOverlayConfig,
      fileOverlay(),
      displayBailoutOverlay(),
      // source map loader
      {
        devtool: 'cheap-module-eval-source-map',
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
      basicWebpackConfig,
      stylesOverlay(),
      tsOverlayConfig,
      fileOverlay(),
      displayBailoutOverlay(),
      htmlOverlay({
        template: overlayTarget
      }),
      {
        entry: {
          [bundleName]: './src/index.tsx'
        },
        devtool: 'cheap-module-eval-source-map',
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

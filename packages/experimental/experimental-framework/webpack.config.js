const path = require('path');
const webpackEnv = process.env.NODE_ENV || 'production';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: webpackEnv,
  entry: {
    app: path.join(__dirname, './src/index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'experimental-framework.bundle.js'
  },
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(tsx|ts|jsx|js|mjs)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'experimental-framework.stats.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsOptions: {
        source: false,
        reasons: false,
        chunks: false
      },
      statsFilename: 'experimental-framework.stats.json',
      logLevel: 'warn'
    })
  ],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js'], // read files in following order
    alias: Object.assign({
      'react-native$': 'react-native-web'
    })
  }
};

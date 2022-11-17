import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  name: 'fluentui-react-native-testing',
  mode: 'development',
  target: 'node',
  context: __dirname,
  devtool: 'source-map',

  entry: {
    furnTestSpecs: path.join(__dirname, 'src/E2E/index.win32.ts'),
  },
  output: {
    filename: 'win32_specs.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    usedExports: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { allowTsInNodeModules: true },
        include: [path.resolve(__dirname, './src')],
      },
    ],
  },
  ignoreWarnings: [
    {
      message: /Critical dependency/,
    },
  ],
};

export default config;

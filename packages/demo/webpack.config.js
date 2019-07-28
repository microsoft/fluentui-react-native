module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './public'
  }
};

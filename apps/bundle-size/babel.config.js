const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        disableImportExportTransform: env === 'production' && Boolean(process.env.RNX_METRO_SERIALIZER_ESBUILD),
      },
    ],
  ],
  plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
};

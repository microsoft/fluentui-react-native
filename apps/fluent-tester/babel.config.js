const env = process.env.BABEL_ENV || process.env.NODE_ENV;
module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      {
        disableImportExportTransform: env === 'production',
      },
    ],
  ],
};

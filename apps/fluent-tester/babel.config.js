module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 12,
        },
      },
    ],
  ],
};

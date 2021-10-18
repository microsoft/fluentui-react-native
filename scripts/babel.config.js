module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    'module:metro-react-native-babel-preset',
    [
      '@babel/plugin-proposal-private-methods',
      {
        loose: true,
      },
    ],
  ],
};

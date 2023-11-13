module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    ['module:metro-react-native-babel-preset', { runtime: 'classic' }],
  ],
  plugins: [
    ['@babel/plugin-proposal-private-property-in-object', { loose: false }],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    ['@babel/plugin-transform-private-methods', { loose: false }],
  ],
};

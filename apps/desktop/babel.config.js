module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'auto',
        targets: { node: 'current' },
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript', { allowSyntheticDefaultImports: true }],
    ['module:@rnx-kit/babel-preset-metro-react-native', { runtime: 'automatic' }],
  ],
  overrides: [
    {
      plugins: [
        [require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
        [require('@babel/plugin-transform-react-jsx-source')],
      ],
    },
  ],
};

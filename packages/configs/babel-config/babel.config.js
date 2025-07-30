module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'auto',
        targets: { node: 'current' },
      },
    ],
    '@babel/preset-react',
    ['@babel/preset-typescript', { allowSyntheticDefaultImports: true }],
    ['module:@react-native/babel-preset', { runtime: 'automatic' }],
    ['@rnx-kit/babel-preset-metro-react-native', { useTransformReactJSXExperimental: true }],
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

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

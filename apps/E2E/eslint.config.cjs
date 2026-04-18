module.exports = [
  ...require('@fluentui-react-native/config/eslint'),
  {
    rules: {
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },
];

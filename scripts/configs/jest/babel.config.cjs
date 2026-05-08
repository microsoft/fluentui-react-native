module.exports = {
  // @ts-expect-error - No types, which is fine since this is only used by Metro, which doesn't use types
  presets: [[require('@rnx-kit/babel-preset-metro-react-native'), { runtime: 'automatic' }]],
};

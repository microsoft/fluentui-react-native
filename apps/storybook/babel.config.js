module.exports = (api) => {
  const platform = api.caller((caller) => caller?.platform);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: platform === 'win32' ? [require.resolve('./scripts/transform-win32-unicode-regex.cjs')] : [],
  };
};

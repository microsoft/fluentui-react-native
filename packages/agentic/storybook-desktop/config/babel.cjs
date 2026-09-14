const transformWin32UnicodeRegex = require.resolve('./transform-win32-unicode-regex.cjs');
const transformStoryTests = require.resolve('./transform-story-tests.cjs');

function createDesktopStorybookBabelConfig(api) {
  const platform = api.caller((caller) => caller?.platform);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [transformStoryTests, ...(platform === 'win32' ? [transformWin32UnicodeRegex] : [])],
  };
}

module.exports = {
  createDesktopStorybookBabelConfig,
};

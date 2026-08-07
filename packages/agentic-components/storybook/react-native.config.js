const project = (() => {
  try {
    const { configureProjects } = require('react-native-test-app');
    return configureProjects({
      macos: {
        sourceDir: 'macos',
      },
      windows: {
        sourceDir: 'windows',
        solutionFile: 'windows/AgenticStorybook.sln',
      },
    });
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  dependencies: {
    // These optional Storybook control dependencies only provide legacy UWP projects. Linking
    // them into the WinUI 3 Fabric app fails, while liteMode does not require their native views.
    '@react-native-community/datetimepicker': {
      platforms: {
        windows: null,
      },
    },
    '@react-native-community/slider': {
      platforms: {
        windows: null,
      },
    },
  },
  ...(project ? { project } : undefined),
};

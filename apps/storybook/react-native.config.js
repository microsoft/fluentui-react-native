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
    'react-native-svg': {
      platforms: {
        windows: null,
      },
    },
  },
  ...(project ? { project } : undefined),
};

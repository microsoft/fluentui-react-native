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
  ...(project ? { project } : undefined),
};

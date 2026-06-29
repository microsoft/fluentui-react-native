const project = (() => {
  try {
    const { configureProjects } = require('react-native-test-app');
    return configureProjects({
      macos: {
        sourceDir: 'macos',
      },
    });
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  ...(project ? { project } : undefined),
};

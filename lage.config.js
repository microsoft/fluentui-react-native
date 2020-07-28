module.exports = {
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    bundle: ['build-tools'],
    ['full-build']: ['build', 'test', 'bundle'],
    lint: ['build-tools'],
    test: ['build-tools', 'lint', 'build']
  }
};

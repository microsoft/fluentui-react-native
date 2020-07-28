module.exports = {
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    buildci: ['build', 'test', 'bundle'],
    bundle: ['build-tools'],
    lint: ['build-tools'],
    test: ['build-tools', 'lint', 'build']
  }
};

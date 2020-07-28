module.exports = {
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    bundle: ['build-tools'],
    test: ['build-tools', 'lint', 'build'],
    lint: ['build-tools']
  }
};

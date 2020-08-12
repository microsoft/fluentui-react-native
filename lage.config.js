module.exports = {
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    buildci: ['build', 'test', 'bundle'],
    bundle: ['build-tools'],
    clean: [],
    depcheck: [],
    lint: ['build-tools'],
    ['verify-api']: [],
    ['update-api']: [],
    test: ['build-tools', 'lint', 'build']
  }
};

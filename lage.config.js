module.exports = {
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    test: ['build'],
    lint: [],
    bundle: ['tooling']
  }
};

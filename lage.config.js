module.exports = {
  npmClient: 'yarn',
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    buildci: ['build', 'test', 'depcheck'],
    bundle: ['build-tools', 'build'],
    clean: [],
    depcheck: ['build-tools', 'align-deps'],
    lint: ['build-tools'],
    prettier: ['build-tools'],
    ['prettier-fix']: ['build-tools'],
    test: ['build-tools', 'lint', 'build'],
  },
};

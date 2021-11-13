module.exports = {
  npmClient: 'yarn',
  pipeline: {
    ['build-tools']: ['^build-tools'],
    build: ['build-tools', '^build'],
    buildci: ['build', 'test', 'depcheck', 'bundle'],
    bundle: ['build-tools', 'build'],
    clean: [],
    depcheck: ['build-tools'],
    lint: ['build-tools'],
    prettier: ['build-tools'],
    ['prettier-fix']: ['build-tools'],
    test: ['build-tools', 'lint', 'build'],
  },
};

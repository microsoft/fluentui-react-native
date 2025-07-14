module.exports = {
  npmClient: 'yarn',
  pipeline: {
    build: ['^build'],
    buildci: ['build', 'test', 'depcheck'],
    bundle: ['build'],
    clean: [],
    depcheck: ['align-deps'],
    lint: [],
    prettier: [],
    ['prettier-fix']: [],
    test: ['build', 'lint'],
  },
};

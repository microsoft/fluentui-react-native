module.exports = {
  npmClient: 'yarn',
  pipeline: {
    'build-cjs': {
      dependsOn: ['^build-cjs'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib-commonjs/**/*'],
    },
    'build-esm': {
      dependsOn: ['^build-esm'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib/**/*'],
    },
    'build-dual': {
      dependsOn: ['build-cjs', 'build-esm'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib/**/*', 'lib-commonjs/**/*'],
    },
    buildci: ['build-dual', 'test', 'lint', 'lint-package', 'check-publishing'],
    bundle: {
      inputs: ['**/*', '!node_modules/**/*', '!dist/**/*', '!lib/**/*', '!lib-commonjs/**/*'],
      outputs: ['dist/**/*'],
    },
    clean: {
      cache: false,
    },
    lint: {
      inputs: ['*', 'src/**/*'],
      outputs: [],
    },
    'lint-package': {
      inputs: ['**/*', '!node_modules/**/*', '!dist/**/*', '!lib/**/*', '!lib-commonjs/**/*'],
      outputs: [],
    },
    prettier: {
      inputs: ['*', 'src/**/*'],
      outputs: [],
    },
    ['pr-check']: ['build-dual', 'test', 'lint', 'check-publishing', 'align-deps', 'lint-package', 'lint-lockfile', 'prettier'],
    ['prettier-fix']: [],
    test: {
      dependsOn: ['build-dual'],
      inputs: [],
      outputs: [],
    },
  },
};

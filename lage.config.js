module.exports = {
  npmClient: 'yarn',
  pipeline: {
    build: {
      dependsOn: ['^build'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib/**/*', 'lib-commonjs/**/*'],
    },
    buildci: ['build', 'test', 'lint', 'depcheck', 'check-publishing'],
    bundle: {
      inputs: ['**/*', '!node_modules/**/*', '!dist/**/*', '!lib/**/*', '!lib-commonjs/**/*'],
      outputs: ['dist/**/*'],
    },
    clean: {
      cache: false,
    },
    depcheck: {
      inputs: ['**/*', '!node_modules/**/*', '!dist/**/*', '!lib/**/*', '!lib-commonjs/**/*'],
      outputs: [],
    },
    lint: {
      inputs: ['*', 'src/**/*'],
      outputs: [],
    },
    prettier: {
      inputs: ['*', 'src/**/*'],
      outputs: [],
    },
    ['prettier-fix']: [],
    test: {
      dependsOn: ['build'],
      inputs: [],
      outputs: [],
    },
  },
};

/** @type {import('lage').ConfigOptions} */
const config = {
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
    buildci: ['build-dual', 'test', 'lint', 'lint-package'],
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
    format: {
      inputs: ['*', 'src/**/*'],
      outputs: [],
    },
    'pr-check': ['buildci', 'lint-package', 'lint-lockfile', 'format:check'],
    test: {
      dependsOn: ['build-dual'],
      inputs: [],
      outputs: [],
    },
    publish: {
      dependsOn: ['^publish'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/publish.js',
      },
      cache: false,
    },
    'publish-dry-run': {
      dependsOn: ['^publish-dry-run'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/publish.js',
        dryRun: true,
      },
      cache: false,
    },
  },
};

module.exports = config;

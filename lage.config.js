/** @type {import('lage').ConfigOptions} */
const config = {
  npmClient: 'yarn',
  pipeline: {
    'build-cjs': {
      // cjs builds need to wait for the esm builds to produce the type definitions
      dependsOn: ['^build-core', '^build-cjs'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib-commonjs/**/*'],
    },
    'build-core': {
      // the core build does esm builds (which produce type definitions used by both cjs and esm builds)
      // this also handles noEmit packages which should be run in sequence with other packages
      dependsOn: ['^build-core'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib/**/*'],
    },
    'build-all': {
      dependsOn: ['build-core', 'build-cjs'],
      inputs: ['*', 'src/**/*', 'assets/**/*'],
      outputs: ['lib/**/*', 'lib-commonjs/**/*'],
    },
    buildci: ['build-all', 'test', 'lint', 'lint-package'],
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
      dependsOn: ['build-all'],
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

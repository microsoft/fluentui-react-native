/** @type {import('lage').ConfigOptions} */
const config = {
  npmClient: 'yarn',
  pipeline: {
    // ── Per-package tasks ──────────────────────────────────────────────────
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
    test: {
      dependsOn: ['build-all'],
      inputs: [],
      outputs: [],
    },

    // ── Root-only tasks (scripts exist only in the root package.json) ──────
    // These run once for the whole repo. Sub-packages do not have these scripts,
    // so lage naturally scopes them to the root workspace.
    'check-publishing': {
      cache: false,
    },
    'format:check': {
      cache: false,
    },
    'lint-lockfile': {
      cache: false,
    },

    // ── Pipeline aliases ───────────────────────────────────────────────────
    'repo-checks': ['lint-lockfile', 'format:check', 'check-publishing'],
    buildci: ['build-all', 'test', 'lint', 'lint-package', 'repo-checks'],

    // ── Worker tasks ───────────────────────────────────────────────────────
    publish: {
      dependsOn: ['^publish'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/publish.js',
      },
      cache: false,
    },
    'publish:dry-run': {
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

export default config;

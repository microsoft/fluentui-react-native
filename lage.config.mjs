/** @type {import('lage').ConfigOptions} */
const config = {
  npmClient: 'yarn',
  pipeline: {
    // ── Per-package tasks ──────────────────────────────────────────────────
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
    test: {
      // The unified build is a single root target, not a per-package `build`.
      // A bare 'build' would resolve to <thisPackage>#build,
      // which doesn't exist, so lage silently drops the edge. Point at the
      // specific root target with the packageName#task syntax so every
      // package's tests wait for the whole-repo build to finish.
      dependsOn: ['@fluentui-react-native/root#root-build'],
      inputs: [],
      outputs: [],
    },

    // ── Root-only tasks (scripts exist only in the root package.json) ──────
    // These run once for the whole repo. Sub-packages do not have these scripts,
    // so lage naturally scopes them to the root workspace.
    build: {
      // tsc project level build has its own caching
      cache: false,
    },
    'check-publishing': {
      cache: false,
    },
    'format:check': {
      cache: false,
    },
    'lint-lockfile': {
      cache: false,
    },
    'lint-repo': {
      cache: false,
    },
    prebuild: {
      /**
       * Prebuild is a pre-build step that can either modify the source code or generate additional files in the project.
       */
      dependsOn: ['^prebuild'],
      inputs: ['**/*', '!node_modules/**/*', '!dist/**/*', '!lib/**/*', '!lib-commonjs/**/*'],
      outputs: ['lib/**/*', 'src/**/*'],
    },
    'root-prebuild': {
      cache: false,
    },
    'root-build': {
      dependsOn: ['@fluentui-react-native/root#root-prebuild'],
      cache: false,
    },

    // ── Pipeline aliases ───────────────────────────────────────────────────
    'repo-checks': ['lint-repo', 'check-publishing'],
    buildci: ['lint-repo', 'check-publishing', '@fluentui-react-native/root#root-build', 'test', 'lint'],

    // ── Worker tasks ───────────────────────────────────────────────────────
    'test-links': {
      // Runs markdown-link-check once per package directory; lage parallelizes
      // across packages. The worker stops at nested package boundaries so the
      // root target does not recurse into workspace directories.
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/test-links.mts',
      },
      cache: false,
    },
    pack: {
      dependsOn: ['@fluentui-react-native/root#build', '^pack'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/pack.mts',
        outputDir: '_packed',
      },
      cache: false,
    },
    publish: {
      dependsOn: ['^publish'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/publish.mts',
        outputDir: '_packed',
      },
      cache: false,
    },
    'publish:dry-run': {
      dependsOn: ['^publish:dry-run'],
      type: 'worker',
      options: {
        worker: 'scripts/src/worker/publish.mts',
        outputDir: '_packed',
        dryRun: true,
      },
      cache: false,
    },
  },
};

export default config;

// @ts-check

const { task, series, parallel, condition, option, argv, addResolvePath, prettierCheckTask, prettierTask } = require('just-scripts');

const path = require('path');
const fs = require('fs');

const { clean } = require('./tasks/clean');
const { copy } = require('./tasks/copy');
const { jest } = require('./tasks/jest');
const { build } = require('./tasks/build');
const { eslint } = require('./tasks/eslint');
const { depcheckTask } = require('./tasks/depcheck');
const { checkForModifiedFiles } = require('./tasks/checkForModifiedFilesTask');
const { findGitRoot } = require('workspace-tools');

export function preset() {
  // this add s a resolve path for the build tooling deps like TS from the scripts folder
  addResolvePath(__dirname);

  option('production');

  // Adds an alias for 'npm-install-mode' for backwards compatibility
  option('min', { alias: 'npm-install-mode' });

  // Build only commonjs (not other TS variants) but still run other tasks
  option('commonjs');

  // for options that have a check/fix switch this puts them into fix mode
  option('fix');

  task('clean', clean);
  task('copy', copy);
  task('jest', jest);
  task('ts', build);
  task('eslint', eslint);
  task('prettier', () =>
    argv().fix
      ? prettierTask({ files: ['src/.'], ignorePath: path.join(findGitRoot(process.cwd()), '.prettierignore') })
      : prettierCheckTask({ files: ['src/.'], ignorePath: path.join(findGitRoot(process.cwd()), '.prettierignore') }),
  );
  task('checkForModifiedFiles', checkForModifiedFiles);

  task(
    'validate',
    parallel(
      'eslint',
      condition('jest', () => fs.existsSync(path.join(process.cwd(), 'jest.config.js'))),
    ),
  );

  task('build', series('clean', 'copy', 'ts'));

  task('depcheck', depcheckTask);

  task('no-op', () => {});
}

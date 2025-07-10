// @ts-check

import { task, series, parallel, condition, option, argv, addResolvePath, prettierCheckTask, prettierTask } from 'just-scripts';

import path from 'path';
import fs from 'fs';

import { clean } from '../src/tasks/clean.js';
import { copy } from '../src/tasks/copy.js';
import { jest } from '../src/tasks/jest.js';
import { build } from '../src/tasks/build.js';
import { eslint } from '../src/tasks/eslint.js';
import { depcheckTask } from '../src/tasks/depcheck.js';
import { checkForModifiedFiles } from '../src/tasks/checkForModifiedFilesTask.js';
import { findGitRoot } from 'workspace-tools';
import { fileURLToPath } from 'url';

// this adds a resolve path for the build tooling deps like TS from the scripts folder
addResolvePath(fileURLToPath(import.meta.url));

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

// @ts-check

import { task, series, parallel, option, argv, tscTask, cleanTask, eslintTask, prettierTask, prettierCheckTask } from 'just-scripts';

import path from 'path';

const srcPath = path.join(process.cwd(), 'src');
const libPath = path.join(process.cwd(), 'lib');

const checkPublishing = () => {
  const { checkPublishingTask } = require('./src/tasks/checkPublishingTask.js');
  return checkPublishingTask();
};

const checkForModifiedFiles = () => {
  const { checkForModifiedFiles } = require('./src/tasks/checkForModifiedFilesTask.js');
  return checkForModifiedFiles();
};

module.exports = function preset() {
  option('production');

  task(
    'ts',
    tscTask({
      pretty: true,
      allowJs: true,
      target: 'es6',
      outDir: 'lib',
      module: 'commonjs',
      ...(argv().production && { inlineSources: true, sourceRoot: path.relative(libPath, srcPath) }),
    }),
  );

  task('depcheck', checkPublishing);
  task('lint', eslintTask({ files: ['src/'] }));
  task('prettier', () => (argv().fix ? prettierTask : prettierCheckTask));
  task('cleanlib', cleanTask([libPath]));
  task('checkForModifiedFiles', checkForModifiedFiles);
  task('build', series('cleanlib', parallel('lint', 'ts')));
  task('no-op', () => {});
  task('clean', 'no-op');
};

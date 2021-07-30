// @ts-check

const { task, series, parallel, option, argv, tscTask, cleanTask, eslintTask, prettierTask, prettierCheckTask } = require('just-scripts');

const path = require('path');

const srcPath = path.join(process.cwd(), 'src');
const libPath = path.join(process.cwd(), 'lib');

const checkPublishing = () => {
  const { checkPublishingTask } = require('./lib/tasks/checkPublishingTask');
  return checkPublishingTask();
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
  task('build', series('cleanlib', parallel('lint', 'ts')));
  task('no-op', () => {});
  task('clean', 'no-op');
};

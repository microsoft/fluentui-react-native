// @ts-check

const { task, series, parallel, option, argv, tscTask, cleanTask, eslintTask } = require('just-scripts');
const { depcheckTask } = require('@uifabricshared/build-native/tasks/depcheck');

const path = require('path');

const srcPath = path.join(process.cwd(), 'src');
const libPath = path.join(process.cwd(), 'lib');

module.exports = function preset() {
  option('production');

  task(
    'ts',
    tscTask({
      pretty: true,
      target: 'es6',
      outDir: 'lib',
      module: 'commonjs',
      ...(argv().production && { inlineSources: true, sourceRoot: path.relative(libPath, srcPath) })
    })
  );

  task('lint', eslintTask({ files: ['src/.'] }));
  task('cleanlib', cleanTask([libPath]));
  task('build', series('cleanlib', parallel('lint', 'ts')));
  task('no-op', () => {});
  task('clean', 'no-op');
  task('depcheck', depcheckTask);
};

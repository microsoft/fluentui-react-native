// @ts-check

const { task, series, parallel, option, argv, tscTask, cleanTask, eslintTask } = require('just-scripts');

const path = require('path');

const srcPath = path.join(process.cwd(), 'src');
const libPath = path.join(process.cwd(), 'lib');

module.exports = function preset() {
  option('production');

  task('clean', cleanTask([libPath]));

  task(
    'ts',
    tscTask({
      pretty: true,
      target: 'es6',
      outDir: 'lib',
      module: 'esnext',
      ...(argv().production && { inlineSources: true, sourceRoot: path.relative(libPath, srcPath) })
    })
  );

  task('lint', eslintTask({ files: ['src/.'] }));
  task('build', series('clean', parallel('lint', 'ts')));
  task('no-op', () => {});
};

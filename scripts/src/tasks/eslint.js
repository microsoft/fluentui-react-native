// @ts-check

const { argv, eslintTask } = require('just-scripts');
exports.eslint = eslintTask({
  files: ['src/'],
  ...argv(),
});

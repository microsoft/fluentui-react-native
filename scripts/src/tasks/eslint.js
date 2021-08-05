// @ts-check

const { eslintTask } = require('just-scripts');
exports.eslint = eslintTask({
  files: ['src/'],
});

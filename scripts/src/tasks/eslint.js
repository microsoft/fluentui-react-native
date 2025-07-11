// @ts-check

const { argv } = require('just-scripts');
const { runScript } = require('../utils/runScript.js');

/**
 * @returns {import('just-scripts').TaskFunction}
 */
module.exports.eslint = () => {
  return async (done) => {
    const args = argv().fix ? ['--fix'] : [];
    const result = await runScript('eslint', 'src/', ...args);
    if (result !== 0) {
      done(new Error(`ESLint failed with exit code ${result}`));
    } else {
      done();
    }
  };
};

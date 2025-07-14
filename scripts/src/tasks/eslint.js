// @ts-check

import { argv } from 'just-scripts';
import { runScript } from '../utils/runScript.js';

/**
 * @returns {import('just-scripts').TaskFunction}
 */
export const eslint = () => {
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

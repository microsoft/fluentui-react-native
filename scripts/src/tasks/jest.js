// @ts-check

import { argv } from 'just-scripts';
import { runScript } from '../utils/runScript.js';

/**
 * @returns {import('just-scripts').TaskFunction}
 */
export function jest() {
  return async (done) => {
    const args = ['--passWithNoTests'];
    if (process.env.TF_BUILD) {
      args.push('--runInBand');
    }
    if (argv().u || argv().updateSnapshot) {
      args.push('--updateSnapshot');
    }

    const result = await runScript('jest', 'src/', ...args);
    if (result !== 0) {
      done(new Error(`Jest failed with exit code ${result}`));
    } else {
      done();
    }
  };
}

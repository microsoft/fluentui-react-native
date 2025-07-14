// @ts-check

import { argv, logger } from 'just-scripts';
import { runScript } from '../utils/runScript.js';
import fs from 'fs';
import path from 'path';

/**
 * @returns {import('just-scripts').TaskFunction}
 */
export function jest() {
  return async (done) => {
    if (!fs.existsSync(path.join(process.cwd(), './jest.config.js'))) {
      logger.warn('No jest configuration found, skipping jest.');
      done();
      return;
    }
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

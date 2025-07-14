// @ts-check

import { logger } from 'just-task';
import os from 'os';
import { execSync } from 'child_process';

/**
 *
 * @returns {(import('just-task').TaskFunction)}
 */
export function checkForModifiedFiles() {
  return function (done) {
    try {
      /** @type {(value: string) => boolean} */
      const notEmpty = (value) => value.trim() !== '';

      const gitStatusOutput = execSync('git status -s --untracked-files=no').toString('utf8');
      const hasChangedFiles = gitStatusOutput.split(os.EOL).filter(notEmpty).length > 0;

      if (hasChangedFiles) {
        logger.error('This build has files that are tracked by git that resulted in changed files.');
        logger.error('Check the following output and resolve the problem that caused these files to change');
        logger.error('Most likely you committed your files with --no-verify');
        logger.error(gitStatusOutput);

        logger.error(execSync('git diff').toString('utf8'));

        throw new Error('change file is required');
      }
    } catch (err) {
      done(err instanceof Error ? err : new Error());
    }
    logger.info('No errors found');
    done();
  };
}

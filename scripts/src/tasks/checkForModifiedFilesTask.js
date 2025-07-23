// @ts-check

import { Command } from 'clipanion';
import os from 'os';
import { execSync } from 'child_process';

export class CheckChangesCommand extends Command {
  /** @override */
  static paths = [['check-changes']];

  /** @override */
  static usage = Command.Usage({
    description: 'Check for modified files tracked by git',
    details: 'This command checks if there are any tracked files that have been modified and not committed.',
    examples: [['Check for modified files', '$0 check-changes']],
  });

  async execute() {
    try {
      /** @type {(value: string) => boolean} */
      const notEmpty = (value) => value.trim() !== '';

      const gitStatusOutput = execSync('git status -s --untracked-files=no').toString('utf8');
      const hasChangedFiles = gitStatusOutput.split(os.EOL).filter(notEmpty).length > 0;

      if (hasChangedFiles) {
        console.error('This build has files that are tracked by git that resulted in changed files.');
        console.error('Check the following output and resolve the problem that caused these files to change');
        console.error('Most likely you committed your files with --no-verify');
        console.error(gitStatusOutput);

        console.error(execSync('git diff').toString('utf8'));

        throw new Error('change file is required');
      }

      console.info('No errors found');
      return 0;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Check for modified files failed');
    }
  }
}

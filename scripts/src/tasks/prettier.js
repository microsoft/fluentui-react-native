// @ts-check

import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.js';

export class PrettierCommand extends Command {
  /** @override */
  static paths = [['prettier']];

  /** @override */
  static usage = Command.Usage({
    description: 'Formats the current package',
    details: 'This command formats the current package using prettier.',
    examples: [['Format the current package', '$0 prettier']],
  });

  fix = Option.Boolean('fix', false, {
    description: 'Automatically fix issues where possible',
  });

  async execute() {
    const fixOrCheck = this.fix ? '--write' : '--check';
    return await runScript(
      'prettier',
      fixOrCheck,
      '--logLevel',
      'error',
      '**/*.{js,json,jsx,md,mjs,ts,tsx,yml}',
      '!{CODE_OF_CONDUCT,SECURITY}.md',
      '!**/{__fixtures__,lib}/**',
      '!**/CHANGELOG.*',
    );
  }
}

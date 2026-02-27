// @ts-check

import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.js';
import { isFixMode } from '../utils/env.ts';

export class FormatCommand extends Command {
  /** @override */
  static paths = [['format']];

  /** @override */
  static usage = Command.Usage({
    description: 'Formats the current package',
    details: 'This command formats the current package using oxfmt.',
    examples: [['Format the current package', '$0 format']],
  });

  check = Option.Boolean('--check', false, {
    description: 'Check if there are formatting isssues without fixing them.',
  });

  async execute() {
    const args = isFixMode(!this.check) ? [] : ['--check'];
    return await runScript('oxfmt', ...args);
  }
}

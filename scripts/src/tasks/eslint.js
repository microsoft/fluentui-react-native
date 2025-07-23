// @ts-check

import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.js';

export class LintCommand extends Command {
  /** @override */
  static paths = [['lint'], ['eslint']];

  /** @override */
  static usage = Command.Usage({
    description: 'Lints the current package',
    details: 'This command lints the current package using ESLint.',
    examples: [['Lint the current package', '$0 lint']],
  });

  args = Option.Proxy();

  async execute() {
    const args = this.args.length > 0 ? this.args : [];
    return await runScript('eslint', 'src/', ...args);
  }
}

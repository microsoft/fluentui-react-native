// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, Option } from 'clipanion';
import { isFixMode } from '../utils/env.ts';

export class LintCommand extends Command {
  /** @override */
  static paths = [['lint']];

  /** @override */
  static usage = Command.Usage({
    description: 'Lints the current package',
    details: 'This command lints the current package using oxlint.',
    examples: [['Lint the current package', '$0 lint']],
  });

  args = Option.Proxy();

  async execute() {
    const oxlint = new URL('./cli.js', import.meta.resolve('oxlint'));
    const args = [process.argv0, fileURLToPath(oxlint), '-c', this.configPath, '--ignore-pattern=__fixtures__', ...this.args];

    if (isFixMode()) {
      args.push('--fix');
    }

    if (process.platform === 'win32') {
      args.push('--threads=1');
    }

    process.argv = args;
    await import(oxlint.href);

    if (process.exitCode == null) {
      return 0;
    }

    return typeof process.exitCode === 'number' ? process.exitCode : -1;
  }

  get configPath() {
    const localConfig = path.join(process.cwd(), 'oxlint.config.ts');
    if (fs.existsSync(localConfig)) {
      return localConfig;
    }

    return fileURLToPath(new URL('../../../packages/configs/lint-config-rules/private.ts', import.meta.url));
  }
}

// @ts-check
import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.js';
import fs from 'node:fs';
import path from 'node:path';

export class JestCommand extends Command {
  /** @override */
  static paths = [['jest']];

  /** @override */
  static usage = Command.Usage({
    description: 'Tests the current package using jest',
    details: 'This command tests the current package.',
    examples: [['Test the current package', '$0 jest']],
  });

  args = Option.Proxy();

  async execute() {
    if (!fs.existsSync(path.join(process.cwd(), './jest.config.js'))) {
      console.warn('No jest configuration found, skipping jest.');
      return;
    }
    const args = ['--passWithNoTests'];
    if (process.env.TF_BUILD) {
      args.push('--runInBand');
    }

    return await runScript('jest', 'src/', ...args, ...this.args);
  }
}

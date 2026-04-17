// @ts-check
import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.js';
import { getProjectRoot } from '../utils/projectRoot.ts';
import { isJestEnabled } from '../preinstall/package-config.ts';

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
    const projectRoot = getProjectRoot(process.cwd());
    if (!isJestEnabled(projectRoot.root, projectRoot.manifest)) {
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

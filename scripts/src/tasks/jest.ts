import { Command, Option } from 'clipanion';
import { runScript } from '../utils/runScript.ts';
import { hasJestConfig } from '../preinstall/tool-versions.ts';

export class JestCommand extends Command {
  static override paths = [['jest']];

  static override usage = Command.Usage({
    description: 'Tests the current package using jest',
    details: 'This command tests the current package.',
    examples: [['Test the current package', '$0 jest']],
  });

  args = Option.Proxy();

  async execute() {
    if (!hasJestConfig(process.cwd())) {
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

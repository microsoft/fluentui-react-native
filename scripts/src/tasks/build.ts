// @ts-check

import { Command } from 'clipanion';
import { runYarn } from '../utils/runScript.js';
import { getProjectRoot } from '../utils/projectRoot.ts';
import { getResolvedConfig } from '../utils/buildConfig.ts';

export class BuildCommand extends Command {
  /** @override */
  static override paths = [['build']];

  /** @override */
  static override usage = Command.Usage({
    description: 'Builds the current package using TypeScript compiler',
    details: 'This command builds the current package based on the tsconfig.json and package.json configuration.',
    examples: [['Build the current package', '$0 build']],
  });

  async execute() {
    const cwd = process.cwd();
    const buildConfig = getResolvedConfig(getProjectRoot(cwd)).typescript;
    const { cjsScript, esmScript } = buildConfig;

    if (!cjsScript && !esmScript) {
      console.log('No build scripts defined. Skipping build.');
      return 0;
    }

    if (cjsScript) {
      const [cmd, ...args] = cjsScript.split(' ');
      const result = await runYarn(cmd, ...args);
      if (result !== 0) {
        console.error(`Build (cjs) - failed with code ${result}`);
        return result;
      }
    }

    if (esmScript && esmScript !== cjsScript) {
      const [cmd, ...args] = esmScript.split(' ');
      const result = await runYarn(cmd, ...args);
      if (result !== 0) {
        console.error(`Build (esm) - failed with code ${result}`);
        return result;
      }
    }
    return 0;
  }
}

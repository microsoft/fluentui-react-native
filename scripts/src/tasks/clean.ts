import { Command } from 'clipanion';
import fs from 'node:fs';
import path from 'node:path';

export class CleanCommand extends Command {
  static override paths = [['clean']];

  static override usage = Command.Usage({
    description: 'Cleans the current package',
    details: 'This command removes all build artifacts from the current package.',
    examples: [['Clean the current package', '$0 clean']],
  });

  async execute() {
    return cleanFolder();
  }
}

/**
 * Cleans the specified folder by removing certain directories and files.
 */
export function cleanFolder(cwd: string = process.cwd()): number {
  const options = { force: true, maxRetries: 3, recursive: true };
  [
    'lib',
    'temp',
    'dist',
    'lib-amd',
    'lib-commonjs',
    'lib-es2015', // Keep this in clean for actually cleaning up legacy content.
    'coverage',
    'src/**/*.scss.ts',
  ].map((dir) => fs.rmSync(path.join(cwd, dir), options));
  return 0;
}

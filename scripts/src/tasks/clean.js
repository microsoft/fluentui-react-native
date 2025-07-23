// @ts-check

import { Command } from 'clipanion';
import * as fs from 'fs';
import path from 'path';

export class CleanCommand extends Command {
  /** @override */
  static paths = [['clean']];

  /** @override */
  static usage = Command.Usage({
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
 * @param {string} [cwd=process.cwd()] - The target directory to clean.
 */
export function cleanFolder(cwd = process.cwd()) {
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

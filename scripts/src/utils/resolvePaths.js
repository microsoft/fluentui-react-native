import findUp from 'find-up';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Find all node_modules directories up to the project root
 * @returns {string[]} - An array of paths to node_modules directories found in the project root.
 */
export function nodeModulesToRoot() {
  /** @type {string[]} */
  const results = [];
  findUp.sync((directory) => {
    const nodeModulesPath = path.join(directory, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      results.push(nodeModulesPath.replace(/\\/g, '/'));
    }

    const gitRoot = path.join(directory, '.git');
    return fs.existsSync(gitRoot) ? findUp.stop : undefined;
  });
  return results;
}

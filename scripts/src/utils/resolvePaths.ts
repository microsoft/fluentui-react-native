'use strict';

import fs from 'fs';
import path from 'path';
import findUp from 'find-up';

export function nodeModulesToRoot(): string[] {
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

/**
 * take a path, call path.normalize, then make sure it uses forward slashes
 * @param base - path to put into forward slashed form
 */
export function normalizeToUnixPath(base: string): string {
  return path.normalize(base).replace(/\\/g, '/');
}

function queryModule(name: string, direct?: boolean): string {
  const cur = direct
    ? path.resolve(require.resolve(name, { paths: [process.cwd()] }))
    : path.resolve(require.resolve(name + '/package.json', { paths: [process.cwd()] }), '..');
  return normalizeToUnixPath(fs.realpathSync(cur));
}

/**
 * Resolve a module to a true, normalized, non-symlink path
 * @param moduleName - name of the module to resolve
 */
export function resolveModule(moduleName: string): string {
  return queryModule(moduleName);
}

/**
 * Resolve a file reference to a true, normalized, non-symlink path
 * @param fileName - file to resolve
 */
export function resolveFile(fileName: string) {
  return queryModule(fileName, true);
}

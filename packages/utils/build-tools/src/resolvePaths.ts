'use strict';

import { findGitRoot, normalizeToUnixPath } from 'just-repo-utils';
import fs from 'fs';
import path from 'path';

export function nodeModulesToRoot(): string[] {
  const results = [];
  findGitRoot(cur => {
    const nodeModulePath = path.join(cur, 'node_modules');
    if (fs.existsSync(nodeModulePath)) {
      results.push(nodeModulePath.replace(/\\/g, '/'));
    }
    return false;
  });
  return results;
}

function queryModule(name: string, direct?: boolean): string {
  const cur = direct ? path.resolve(require.resolve(name)) : path.resolve(require.resolve(name + '/package.json'), '..');
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

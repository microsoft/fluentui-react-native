import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @param {Object} workspace           The package currently being processed
 * @param {string} workspace.cwd       Path of the current package
 * @param {Object} workspace.manifest  The content of `package.json`
 * @returns {{
 *   dependencies?: Record<string, string>;
 *   peerDependencies?: Record<string, string>;
 *   peerDependenciesMeta?: Record<string, { optional?: boolean }>;
 * }}
 */

/**
 * These are the dependencies we want to ensure exist in each folder. They will not override
 * the dependencies in the package.json if already present.
 */
const scriptDependencies = getScriptFolderDependencies(['typescript', 'eslint', 'just-scripts']);

/**
 * Get the dependencies for the script folder, both `devDependencies` and `dependencies`
 * @param {string[]} keys - The keys of the dependencies to include
 * @returns {Record<string, string>} A map of dependencies for the script folder
 */
function getScriptFolderDependencies(keys) {
  const pkgJsonName = path.join(path.dirname(fileURLToPath(import.meta.url)), './package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonName, 'utf-8'));
  const mergedDeps = { ...pkgJson.devDependencies, ...pkgJson.dependencies };
  return Object.fromEntries(Object.entries(mergedDeps).filter(([key]) => keys.includes(key)));
}

export default function ({ cwd, manifest }) {
  const dependenciesToAdd = {};
  Object.keys(scriptDependencies).forEach((key) => {
    if ((manifest?.dependencies && manifest.dependencies[key]) || (manifest?.devDependencies && manifest.devDependencies[key])) {
      // If the dependency already exists in the package.json, skip it
      return;
    }
    dependenciesToAdd[key] = scriptDependencies[key];
  });
  return {
    dependencies: dependenciesToAdd,
  };
}

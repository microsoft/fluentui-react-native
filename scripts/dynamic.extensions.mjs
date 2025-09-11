// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import { getToolVersion } from './src/preinstall/tool-versions.js';

/**
 * @typedef {() => boolean} ConditionalCheck
 */

/**
 * Conditionally add a dependency to the given dependencies object if it is not already present
 * @param {string[]} depsToAdd
 * @param {import('./src/utils/projectRoot.js').PackageManifest} manifest
 * @param {ConditionalCheck | boolean | undefined} condition
 * @returns {Record<string, string>}
 */
function conditionallyAdd(depsToAdd, manifest, condition) {
  /** @type {Record<string, string>} */
  const newDeps = {};
  if (!condition || (typeof condition === 'function' ? condition() : condition)) {
    for (const dep of depsToAdd) {
      if (!manifest.dependencies?.[dep] && !manifest.devDependencies?.[dep]) {
        const version = getToolVersion(dep);
        if (version) {
          // If the dependency is not already present, and the extra condition is met, add it
          newDeps[dep] = version;
        } else {
          // If the dependency is not found in the base versions, log a warning
          console.warn(`Dependency ${dep} version not found. Skipping dynamic add.`);
        }
      }
    }
  }
  return newDeps;
}

/**
 * @param {import('./src/utils/projectRoot.js').PackageManifest} manifest - The package manifest.
 * @returns {boolean} true if prettier is already in the manifest or if a prettier script is defined
 */
function addPrettier(manifest) {
  return Boolean(manifest && manifest.scripts && (manifest.scripts.prettier || manifest.scripts['prettier-fix']));
}

/**
 * Check if Jest is already in the manifest or if a Jest script is defined.
 * @param {string} cwd - The current working directory.
 * @param {import('./src/utils/projectRoot.js').PackageManifest} manifest - The package manifest.
 * @returns {boolean} - True if Jest should be added, false otherwise.
 */
function addJest(cwd, manifest) {
  return Boolean(manifest.scripts?.test && fs.existsSync(path.join(cwd, 'jest.config.js')));
}

/**
 * Get the dynamic dependencies for the given package given the package root directory and its manifest.
 * @param {{cwd: string, manifest: import('./src/utils/projectRoot.js').PackageManifest}} param0
 * @returns { { dependencies: Record<string, string> } }
 */
export default function ({ cwd, manifest }) {
  const enableLinting = Boolean(manifest.scripts && manifest.scripts.lint);

  return {
    dependencies: {
      ...conditionallyAdd(['typescript', '@types/node', '@types/jest'], manifest, () => fs.existsSync(path.join(cwd, 'tsconfig.json'))),
      ...conditionallyAdd(['eslint'], manifest, enableLinting),
      ...conditionallyAdd(['prettier'], manifest, () => addPrettier(manifest)),
      ...conditionallyAdd(['jest', '@types/jest'], manifest, () => addJest(cwd, manifest)),
    },
  };
}

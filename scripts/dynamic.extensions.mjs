// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef {() => boolean} ConditionalCheck
 * @typedef {Record<string, string>} DependencySet
 * @typedef {{scripts?: Record<string, string>, dependencies?: DependencySet, devDependencies?: DependencySet}} PkgManifest
 */

/**
 * Get the package.json manifest for a given folder.
 * @param {string} folder
 * @returns {PkgManifest}
 */
function getPackageManifest(folder) {
  const manifestPath = path.join(folder, 'package.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// Get the versions once, so we don't query again on each package
const scriptFolder = path.dirname(fileURLToPath(import.meta.url));
const scriptManifest = getPackageManifest(scriptFolder);
const rootManifest = getPackageManifest(path.dirname(scriptFolder));
// all merged versions from the root and script manifests
// have the root manifest take precedence over the script manifest, this allows the script folder to ingest newer
// tooling without updating all projects in the repo
const baseVersions = {
  ...scriptManifest?.devDependencies,
  ...scriptManifest?.dependencies,
  ...rootManifest?.devDependencies,
  ...rootManifest?.dependencies,
};

/**
 * Conditionally add a dependency to the given dependencies object if it is not already present
 * @param {string[]} depsToAdd
 * @param {PkgManifest} manifest
 * @param {ConditionalCheck | boolean | undefined} condition
 * @returns {Record<string, string>}
 */
function conditionallyAdd(depsToAdd, manifest, condition) {
  /** @type {DependencySet} */
  const newDeps = {};
  if (!condition || (typeof condition === 'function' ? condition() : condition)) {
    for (const dep of depsToAdd) {
      if (!manifest.dependencies?.[dep] && !manifest.devDependencies?.[dep]) {
        if (baseVersions[dep]) {
          // If the dependency is not already present, and the extra condition is met, add it
          newDeps[dep] = baseVersions[dep];
        } else {
          // If the dependency is not found in the base versions, log a warning
          console.warn(`Dependency ${dep} not found in base versions. Skipping dynamic add.`);
        }
      }
    }
  }
  return newDeps;
}

/**
 * @param {PkgManifest} manifest
 * @returns {boolean} true if prettier is already in the manifest or if a prettier script is defined
 */
function addPrettier(manifest) {
  return Boolean(manifest && manifest.scripts && (manifest.scripts.prettier || manifest.scripts['prettier-fix']));
}

/**
 * Get the dynamic dependencies for the given package given the package root directory and its manifest.
 * @param {{cwd: string, manifest: PkgManifest}} param0
 * @returns { { dependencies: Record<string, string> } }
 */
export default function ({ cwd, manifest }) {
  const enableLinting = Boolean(manifest.scripts && manifest.scripts.lint);

  return {
    dependencies: {
      ...conditionallyAdd(['typescript'], manifest, () => fs.existsSync(path.join(cwd, 'tsconfig.json'))),
      ...conditionallyAdd(['eslint'], manifest, enableLinting),
      ...conditionallyAdd(['prettier'], manifest, () => addPrettier(manifest)),
    },
  };
}

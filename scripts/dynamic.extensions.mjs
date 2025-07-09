// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef {() => boolean} ConditionalCheck
 */

/**
 * Get the package.json manifest for a given folder.
 * @param {string} folder
 * @returns {import('@rnx-kit/tools-packages').PackageInfo['manifest']}
 */
function getPackageManifest(folder) {
  const manifestPath = path.join(folder, 'package.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// Get the versions once, so we don't query again on each package
const scriptFolder = path.dirname(fileURLToPath(import.meta.url));
const scriptManifest = getPackageManifest(scriptFolder);
const rootManifest = getPackageManifest(path.dirname(scriptFolder));
// all merged versions from the root and script manifests, scripts having precedence
const baseVersions = {
  ...rootManifest?.devDependencies,
  ...rootManifest?.dependencies,
  ...scriptManifest?.devDependencies,
  ...scriptManifest?.dependencies,
};

/**
 * Conditionally add a dependency to the given dependencies object if it is not already present
 * @param {string[]} depsToAdd
 * @param {import('@rnx-kit/tools-packages').PackageInfo['manifest']} manifest
 * @param {ConditionalCheck | boolean | undefined} condition
 * @returns {Record<string, string>}
 */
function conditionallyAdd(depsToAdd, manifest, condition) {
  /** @type {Record<string, string>} */
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

function addPrettier(manifest) {
  return manifest && manifest.scripts && (manifest.scripts.prettier || manifest.scripts['prettier-fix']);
}

/**
 * Get the dynamic dependencies for the given package given the package root directory and its manifest.
 * @param {{cwd: string, manifest: import('@rnx-kit/tools-packages').PackageInfo['manifest']}} param0
 * @returns { { dependencies: Record<string, string> } }
 */
export default function ({ cwd, manifest }) {
  const dependenciesToAdd = {};
  const enableLinting = Boolean(manifest.scripts && manifest.scripts.lint);

  return {
    dependencies: {
      ...conditionallyAdd(['typescript'], manifest, () => fs.existsSync(path.join(cwd, 'tsconfig.json'))),
      ...conditionallyAdd(['eslint'], manifest, enableLinting),
      ...conditionallyAdd(['prettier'], manifest, () => addPrettier(manifest)),
    },
  };
}

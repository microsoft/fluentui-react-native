import fs from 'node:fs';
import path from 'node:path';
import { getToolVersion, hasJestConfig } from './src/preinstall/tool-versions.ts';
import type { PackageManifest } from './src/utils/projectRoot.ts';

type ConditionalCheck = () => boolean;

/**
 * Conditionally add a dependency to the given dependencies object if it is not already present
 */
function conditionallyAdd(
  depsToAdd: string[],
  manifest: PackageManifest,
  condition: ConditionalCheck | boolean | undefined,
): Record<string, string> {
  const newDeps: Record<string, string> = {};
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
 * Returns true if oxfmt should be added based on the manifest's prettier scripts.
 */
function addOxfmt(manifest: PackageManifest): boolean {
  return Boolean(manifest && manifest.scripts && (manifest.scripts.format || manifest.scripts['format:fix']));
}

/**
 * Check if Jest is already in the manifest or if a Jest script is defined.
 */
function addJest(cwd: string, manifest: PackageManifest): boolean {
  return Boolean(manifest.scripts?.test && hasJestConfig(cwd));
}

/**
 * Get the dynamic dependencies for the given package given the package root directory and its manifest.
 */
export default function ({ cwd, manifest }: { cwd: string; manifest: PackageManifest }): { dependencies: Record<string, string> } {
  const enableLinting = Boolean(manifest.scripts && manifest.scripts.lint);

  return {
    dependencies: {
      ...conditionallyAdd(['typescript', '@types/node', '@types/jest', '@typescript/native-preview'], manifest, () =>
        fs.existsSync(path.join(cwd, 'tsconfig.json')),
      ),
      ...conditionallyAdd(['oxlint', 'oxlint-tsgolint'], manifest, enableLinting),
      ...conditionallyAdd(['oxfmt'], manifest, () => addOxfmt(manifest)),
      ...conditionallyAdd(['jest', '@types/jest'], manifest, () => addJest(cwd, manifest)),
    },
  };
}

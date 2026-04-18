// @ts-check
import { getInjectedDependencies } from '../packages/config/src/repo/details.ts';

/**
 * Get the dynamic dependencies for the given package given the package root directory and its manifest.
 * @param {{cwd: string, manifest: import('../packages/config/src/repo/manifest.ts').PackageManifest}} param0
 * @returns { { dependencies: Record<string, string> } }
 */
export default function ({ cwd, manifest }) {
  const injectedDependencies = getInjectedDependencies(cwd, manifest);
  const currentDependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  /** @type {Record<string, string>} */
  const newDependencies = {};
  for (const [dep, version] of Object.entries(injectedDependencies)) {
    if (!currentDependencies?.[dep]) {
      newDependencies[dep] = version;
    }
  }

  return { dependencies: newDependencies };
}

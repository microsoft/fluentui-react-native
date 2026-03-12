import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';

import { BARREL_PACKAGE, MONO_PACKAGE_NAME, MONO_PACKAGE_SUBPATHS } from './mono-package-constants';

/**
 * Given a dependency name, returns the subpath if it maps to the mono-package, or null.
 */
function getMonoSubpath(depName: string): string | null {
  // @fluentui-react-native/<pkg>
  if (depName.startsWith('@fluentui-react-native/')) {
    const pkg = depName.slice('@fluentui-react-native/'.length);
    return MONO_PACKAGE_SUBPATHS.has(pkg) ? pkg : null;
  }
  // @uifabricshared/<pkg>
  if (depName.startsWith('@uifabricshared/')) {
    const pkg = depName.slice('@uifabricshared/'.length);
    return MONO_PACKAGE_SUBPATHS.has(pkg) ? pkg : null;
  }
  // @fluentui/react-native barrel
  if (depName === BARREL_PACKAGE) {
    return ''; // sentinel: included in mono-package but no specific subpath
  }
  return null;
}

interface MigrateResult {
  removed: string[];
  kept: string[];
  monoPackageAdded: boolean;
}

/**
 * Migrates a package.json by replacing individual @fluentui-react-native/*, @uifabricshared/*,
 * and @fluentui/react-native dependencies with the unified fluentui-react-native mono-package.
 *
 * @param packageJsonPath - Absolute path to the package.json to migrate
 * @param version - Version string for the mono-package (default: "workspace:*")
 * @param dryRun - If true, prints changes without writing
 * @returns Summary of changes
 */
export function migratePackageJson(packageJsonPath: string, version = 'workspace:*', dryRun = false): MigrateResult {
  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found: ${packageJsonPath}`);
  }

  const raw = readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw);

  const removed: string[] = [];
  const kept: string[] = [];
  let needsMono = false;

  for (const field of ['dependencies', 'devDependencies'] as const) {
    const deps = pkg[field];
    if (!deps || typeof deps !== 'object') continue;

    for (const depName of Object.keys(deps)) {
      const subpath = getMonoSubpath(depName);
      if (subpath !== null) {
        delete deps[depName];
        removed.push(depName);
        needsMono = true;
      }
    }
  }

  // Also clean up peerDependencies that reference mono-package deps
  // (but don't add mono-package to peerDependencies)
  if (pkg.peerDependencies) {
    for (const depName of Object.keys(pkg.peerDependencies)) {
      const subpath = getMonoSubpath(depName);
      if (subpath !== null) {
        delete pkg.peerDependencies[depName];
        removed.push(depName);
        needsMono = true;
      }
    }
    // Clean up peerDependenciesMeta for removed peers
    if (pkg.peerDependenciesMeta) {
      for (const depName of Object.keys(pkg.peerDependenciesMeta)) {
        if (getMonoSubpath(depName) !== null) {
          delete pkg.peerDependenciesMeta[depName];
        }
      }
      if (Object.keys(pkg.peerDependenciesMeta).length === 0) {
        delete pkg.peerDependenciesMeta;
      }
    }
    if (Object.keys(pkg.peerDependencies).length === 0) {
      delete pkg.peerDependencies;
    }
  }

  let monoPackageAdded = false;
  if (needsMono) {
    // Add to dependencies (prefer dependencies over devDependencies for runtime packages)
    if (!pkg.dependencies) {
      pkg.dependencies = {};
    }
    if (!pkg.dependencies[MONO_PACKAGE_NAME]) {
      pkg.dependencies[MONO_PACKAGE_NAME] = version;
      monoPackageAdded = true;
    }
  }

  if (!dryRun && removed.length > 0) {
    // Preserve original indentation
    const indent = raw.match(/^(\s+)"/m)?.[1] || '  ';
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, indent) + '\n', 'utf-8');
  }

  return { removed, kept, monoPackageAdded };
}

/**
 * Find the nearest package.json at or above the given path.
 */
export function findPackageJson(targetPath: string): string | null {
  let dir = path.resolve(targetPath);

  // If targetPath is a file, start from its directory
  if (existsSync(dir) && !statSync(dir).isDirectory()) {
    dir = path.dirname(dir);
  }

  while (true) {
    const candidate = path.join(dir, 'package.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return null;
}

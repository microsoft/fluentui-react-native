import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/**
 * @typedef {{default?: string, types?: string, import?: string, require?: string}} ExportSet
 * @typedef {string | ExportSet} ExportEntry
 * @typedef {{'.': ExportEntry, [key: string]: ExportEntry}} Exports
 *
 * @typedef {{name: string, version: string, private?: boolean, bin?: string | Record<string, string>, scripts?: Record<string, string>}} PkgManifestBase
 * @typedef {{main?: string, module?: string, types?: string, type?: string, exports?: Exports}} PkgModuleInfo
 * @typedef {{dependencies?: Record<string, string>, devDependencies?: Record<string, string>, peerDependencies?: Record<string, string>}} PkgDependencyInfo
 * @typedef {string | boolean | string[] | Record<string, unknown> | undefined} PkgCustomField
 *
 * @typedef {PkgManifestBase & PkgModuleInfo & PkgDependencyInfo & Record<string, PkgCustomField>} PackageManifest
 */

const scriptPath = normalizePath(path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const rootPath = path.dirname(scriptPath);

/** @type {Record<string, ProjectRoot>} */
const rootCache = {};

/**
 * Normalize a file path by replacing backslashes with forward slashes.
 * @param {string} p - The file path to normalize.
 * @returns {string} - The normalized file path.
 */
export function normalizePath(p) {
  return path.normalize(p).replaceAll('\\', '/');
}

/**
 * Returns a project root for the given path. This will load from a cache if available, and will throw if a package.json
 * cannot be found at the given path.
 * @param {string} [rootPath=process.cwd()]
 * @returns {ProjectRoot}
 */
export function getProjectRoot(rootPath = process.cwd()) {
  const normalized = normalizePath(rootPath);
  return (rootCache[normalized] ??= new ProjectRoot(normalized));
}

/**
 * @returns {ProjectRoot}
 */
export function getScriptProjectRoot() {
  return getProjectRoot(scriptPath);
}

/**
 * @returns {ProjectRoot}
 */
export function getRepoProjectRoot() {
  return getProjectRoot(rootPath);
}

/**
 * Utilities for looking up information about a given package. This helps loading things like package.json multiple times
 * in a single process and centralizes some functionality.
 */
export class ProjectRoot {
  /** @type {string} */
  root;

  /** @type {PackageManifest} */
  manifest;

  /** @type {NodeRequire | undefined} */
  cachedRequire = undefined;

  /**
   * @param {string} rootPath - root path of the project
   */
  constructor(rootPath) {
    const pkgJsonPath = path.join(rootPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      throw new Error(`No package.json found at ${pkgJsonPath}`);
    }
    this.manifest = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    this.root = rootPath;
  }

  /** @returns {NodeRequire} - built on demand and cached require function */
  get require() {
    return (this.cachedRequire ??= Module.createRequire(this.root));
  }

  /**
   * Adds dependencies to the project manifest.
   * @param {Record<string, string>} depsToAdd
   * @param {'dependencies' | 'devDependencies'} depType
   */
  addDependencies(depsToAdd, depType = 'dependencies') {
    // add the dependencies to the manifest, outputting the dependencies in sorted order
    const existingDeps = (this.manifest[depType] ??= {});
    const newDeps = { ...existingDeps, ...depsToAdd };
    const depKeys = Object.keys(newDeps).sort((a, b) => a.localeCompare(b));
    this.manifest[depType] = Object.fromEntries(depKeys.map((key) => [key, newDeps[key]]));
  }

  /**
   * Removes dependencies from the project manifest.
   * @param {string[]} depsToRemove
   * @param {'dependencies' | 'devDependencies'} depType
   */
  removeDependencies(depsToRemove, depType = 'dependencies') {
    // remove the dependencies from the manifest
    if (this.manifest[depType]) {
      for (const dep of depsToRemove) {
        if (this.manifest[depType][dep]) {
          delete this.manifest[depType][dep];
        }
      }
    }
  }

  writeManifest() {
    // write the manifest to disk
    const pkgJsonPath = path.join(this.root, 'package.json');
    fs.writeFileSync(pkgJsonPath, JSON.stringify(this.manifest, null, 2) + '\n', 'utf-8');
  }

  /**
   * Open a module relative to this project root
   * @param {string} moduleName - name of the module to require
   * @return {ProjectRoot} - a project root opened at the root of the given module
   */
  openModule(moduleName) {
    const pkgJsonPath = this.require.resolve(`${moduleName}/package.json`, { paths: [this.root] });
    return getProjectRoot(path.dirname(pkgJsonPath));
  }

  /**
   * Get the path to a bin entry for a js package.
   * @param {string} command
   * @returns {string | undefined}
   */
  getBinPath(command) {
    const bin = this.manifest.bin;
    if (bin) {
      const binRelative = typeof bin === 'string' ? bin : bin[command];
      if (binRelative) {
        return normalizePath(path.join(this.root, binRelative));
      }
    }
    return undefined;
  }
}

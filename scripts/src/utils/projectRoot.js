import Module from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { getPackageInfoFromPath } from '@rnx-kit/tools-packages';

/**
 * @typedef {{default?: string, types?: string, import?: string, require?: string}} ExportSet
 * @typedef {string | ExportSet} ExportEntry
 * @typedef {{'.': ExportEntry, [key: string]: ExportEntry}} Exports
 *
 * @typedef {{name: string, version: string, private?: boolean, bin?: Record<string, string>, scripts?: Record<string, string>}} PkgManifestBase
 * @typedef {{main?: string, module?: string, types?: string, type?: string, exports?: Exports}} PkgModuleInfo
 * @typedef {{dependencies?: Record<string, string>, devDependencies?: Record<string, string>, peerDependencies?: Record<string, string>}} PkgDependencyInfo
 * @typedef {string | boolean | string[] | Record<string, unknown> | undefined} PkgCustomField
 *
 * @typedef {PkgManifestBase & PkgModuleInfo & PkgDependencyInfo & Record<string, PkgCustomField>} PackageManifest
 */

const scriptPath = path.resolve(path.join('../..', path.dirname(fileURLToPath(import.meta.url))));
const rootPath = path.dirname(scriptPath);

/** @type {Record<string, ProjectRoot>} */
const rootCache = {};

/**
 * @param {string} [rootPath=process.cwd()]
 * @returns {ProjectRoot}
 */
export function getProjectRoot(rootPath = process.cwd()) {
  return (rootCache[rootPath] ??= new ProjectRoot(rootPath));
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

export class ProjectRoot {
  /** @type {import('@rnx-kit/tools-packages').PackageInfo} */
  pkgInfo;

  /** @type {NodeRequire | undefined} */
  cachedRequire = undefined;

  /**
   * @param {string} rootPath - root path of the project
   */
  constructor(rootPath) {
    this.pkgInfo = getPackageInfoFromPath(rootPath);
  }

  /** @returns {NodeRequire} - built on demand and cached require function */
  get require() {
    return (this.cachedRequire ??= Module.createRequire(this.pkgInfo.root));
  }

  /** @returns {string} - the root path of the project */
  get root() {
    return this.pkgInfo.root;
  }

  /** @returns {PackageManifest} - the package manifest */
  get manifest() {
    return this.pkgInfo.manifest;
  }
}

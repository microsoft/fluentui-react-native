import fs from 'fs';
import path from 'path';

/**
 * @typedef {Record<string, string>} Dependencies
 * @typedef {{ import?: string, require?: string, types?: string, default?: string }} ExportSpec
 * @typedef {{
 *   name: string;
 *   version: string;
 *   description: string;
 *   main?: string;
 *   module?: string;
 *   exports?: Record<string, ExportSpec>;
 *   type?: 'module' | 'commonjs';
 *   scripts?: Record<string, string>;
 *   dependencies?: Dependencies;
 *   devDependencies?: Dependencies;
 *   peerDependencies?: Dependencies;
 *   peerDependenciesMeta?: Record<string, { optional?: boolean }>;
 * }} PackageManifest
 */

/**
 * @type {Record<string, PackageManifest>}
 */
const basicPkgCache = {};

/**
 * Get the package manifest for a specific folder.
 * @param {string} [folder]
 * @returns {PackageManifest}
 */
export function getPackageManifest(folder = process.cwd()) {
  if (basicPkgCache[folder]) {
    return basicPkgCache[folder];
  }

  const pkgJsonPath = path.join(folder, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    throw new Error(`No package.json found in folder: ${folder}`);
  }

  const manifest = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  basicPkgCache[folder] = manifest;
  return manifest;
}

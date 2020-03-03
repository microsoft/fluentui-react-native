'use strict';

const { findGitRoot } = require('./file-paths');
const path = require('path');
const glob = require('glob');

/**
 * Returns an object initialized in the format of:
 * {
 *  packageName: { path: normalized path, config: expanded package JSON }
 * }
 *
 * If this is not a package this will return undefined.
 *
 * @param {string} root = root of the search
 * @param {string} pkgPath - subdirectory currently being looked at to see if it is a directory
 */
function buildPackageInfo(root, pkgPath) {
  const pkgJsonPath = `${root}/${pkgPath}`;
  const config = require(pkgJsonPath);
  return { [config.name]: { config, path: path.resolve(pkgJsonPath, '..').replace(/\\/g, '/') } };
}

/**
 * Calls buildPackageInfo for all the glob matches within the pattern
 * @param {string} root - root path for the repo
 * @param {string} pkgGlob - pattern from the lerna.json or yarn workspaces config
 */
function buildPackageInfoForGlob(root, pkgGlob) {
  const matchPattern = pkgGlob + '/package.json';
  const globOptions = { cwd: root, ignore: '**/node_modules/**' };
  return Object.assign({}, ...glob.sync(matchPattern, globOptions).map(subPath => buildPackageInfo(root, subPath)));
}

function queryPackages(packageNames) {
  var gitRoot = findGitRoot().replace(/\\/g, '/');
  var lernaData = require(gitRoot + '/lerna');
  var results = Object.assign({}, ...lernaData.packages.map(pkgGlob => buildPackageInfoForGlob(gitRoot, pkgGlob)));
  return Object.keys(results).map(name => (packageNames ? name : results[name].path));
}

/**
 * Get an array of the package paths for packages in the repo
 */
function getPackagePaths() {
  return queryPackages();
}

exports.getPackagePaths = getPackagePaths;

/**
 * Get an array with the package names for packages in the repo
 */
function getPackageNames() {
  return queryPackages(true);
}

exports.getPackageNames = getPackageNames;

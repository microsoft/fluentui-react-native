'use strict';

const { findGitRoot } = require('./file-paths');
const path = require('path');
const glob = require('glob');

/**
 * Returns an object initialized in the format of:
 * {
 *  packageName: { path: normalized path, config: expanded package JSON, dependencies: {} }
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
  console.log(path.resolve(pkgPath, '..'));
  return { [config.name]: { config, path: path.resolve(pkgJsonPath, '..').replace(/\\/g, '/'), dependencies: {} } };
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

function addPackageDependencies(repoInfo, pkg, key) {
  const config = pkg.config;
  const section = config[key];
  const dependencies = pkg.dependencies;
  if (section) {
    Object.keys(section).forEach(dependency => {
      if (repoInfo[dependency] && !dependencies[dependency]) {
        dependencies[dependency] = repoInfo[dependency];
      }
    });
  }
}

function buildRepoPackageInfo(loadDependencies) {
  const gitRoot = findGitRoot().replace(/\\/g, '/');
  const lernaData = require(gitRoot + '/lerna');
  const results = Object.assign({}, ...lernaData.packages.map(pkgGlob => buildPackageInfoForGlob(gitRoot, pkgGlob)));
  if (loadDependencies) {
    Object.keys(results).forEach(pkg => {
      addPackageDependencies(results, results[pkg], 'dependencies');
      addPackageDependencies(results, results[pkg], 'devDependencies');
      addPackageDependencies(results, results[pkg], 'peerDependencies');
    });
  }
  return results;
}

function getThisPackageName() {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  return packageJson.name;
}

function addRecursiveDependencies(collector, info) {
  const dependencies = info.dependencies;
  Object.keys(dependencies).forEach(dep => {
    if (!collector[dep]) {
      collector[dep] = dependencies[dep];
      addRecursiveDependencies(collector, dependencies[dep]);
    }
  });
}

/**
 * Get an array of the package paths for packages in the repo
 */
function getPackagePaths() {
  const repoInfo = buildRepoPackageInfo();
  return Object.keys(repoInfo).map(name => repoInfo[name].path);
}

exports.getPackagePaths = getPackagePaths;

/**
 * Get an array with the package names for packages in the repo
 */
function getPackageNames() {
  return Object.keys(buildRepoPackageInfo());
}

exports.getPackageNames = getPackageNames;

function getDependentPackages(options = {}) {
  const { name = getThisPackageName(), paths } = options;
  const dependencies = {};
  const repoInfo = buildRepoPackageInfo(true);
  const thisPackage = repoInfo[name];
  if (thisPackage) {
    addRecursiveDependencies(dependencies, thisPackage);
  }
  return Object.keys(dependencies).map(pkg => (paths ? dependencies[pkg].path : pkg));
}

exports.getDependentPackages = getDependentPackages;

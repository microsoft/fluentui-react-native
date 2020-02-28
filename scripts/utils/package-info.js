'use strict';

const { findGitRoot } = require('./file-paths');
const fs = require('fs');
const path = require('path');

function getPackageInfo(subdir, packageName) {
  var normalizedPath = subdir.replace(/\\/g, '/');
  try {
    var packageJson = require(normalizedPath + '/package.json');
    return packageName ? packageJson.name : normalizedPath;
  } catch (_a) {}
  return undefined;
}

/**
 * Parse the lerna package entry and return one or more actual directories to get package info for
 * @param {string} repoRoot - path to the root of the repository
 * @param {string} packageEntry - package entry in the format of "subdir" | "subdir/*" | "subdir/**"
 */
function parseLernaPackageEntry(repoRoot, packageEntry) {
  const parts = packageEntry.split('/');
  var basePath = repoRoot;
  var tailType = '';

  parts.forEach(function(part) {
    tailType = part;
    if (tailType !== '*' && tailType !== '**') {
      basePath = path.join(basePath, part);
    }
  });

  if (tailType === '*' || tailType === '**') {
    var results_1 = [];
    var dirs = fs.readdirSync(basePath).filter(function(f) {
      return fs.statSync(path.join(basePath, f)).isDirectory();
    });
    dirs.forEach(function(dir) {
      var packageDir = path.join(basePath, dir);
      results_1.push(packageDir);
      if (tailType === '**') {
        var subDirs = fs.readdirSync(packageDir).filter(function(f) {
          return fs.statSync(path.join(packageDir, f)).isDirectory();
        });
        subDirs.forEach(function(subDir) {
          return results_1.push(path.join(packageDir, subDir));
        });
      }
    });
    return results_1;
  }
  return [basePath];
}

function queryPackages(packageNames) {
  var gitRoot = findGitRoot();
  var lernaData = require(gitRoot + '/lerna');
  var packages = lernaData.packages;
  var results = [];
  packages.forEach(function(packageEntry) {
    return parseLernaPackageEntry(gitRoot, packageEntry).forEach(function(entry) {
      return results.push(getPackageInfo(entry, packageNames));
    });
  });
  return results.filter(function(p) {
    return p;
  });
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

// @ts-check

const fs = require('fs');
const path = require('path');

function queryModule(name, direct) {
  const cur = direct ? path.resolve(require.resolve(name)) : path.resolve(require.resolve(name + '/package.json'), '..');
  return fs.realpathSync(cur).replace(/\\/g, '/');
}

function getPackageInfo(subdir, packageName) {
  const normalizedPath = subdir.replace(/\\/g, '/');
  try {
    const packageJson = require(normalizedPath + '/package.json');
    return packageName ? packageJson.name : normalizedPath;
  } catch {}
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
  parts.forEach(part => {
    tailType = part;
    if (tailType !== '*' && tailType !== '**') {
      basePath = path.join(basePath, part);
    }
  });
  if (tailType === '*' || tailType === '**') {
    const results = [];
    const dirs = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory());

    dirs.forEach(dir => {
      const packageDir = path.join(basePath, dir);
      results.push(packageDir);
      if (tailType === '**') {
        const subDirs = fs.readdirSync(packageDir).filter(f => fs.statSync(path.join(packageDir, f)).isDirectory());
        subDirs.forEach(subDir => results.push(path.join(packageDir, subDir)));
      }
    });

    return results;
  }
  return [basePath];
}

function queryPackages(packageNames) {
  const gitRoot = require('./findGitRoot')();
  const lernaData = require(gitRoot + '/lerna');
  const packages = lernaData.packages;

  const results = [];
  packages.forEach(packageEntry =>
    parseLernaPackageEntry(gitRoot, packageEntry).forEach(entry => results.push(getPackageInfo(entry, packageNames)))
  );
  return results.filter(p => p);
}

module.exports = {
  resolveModule: moduleName => {
    return queryModule(moduleName);
  },
  resolveFile: fileName => {
    return queryModule(fileName, true);
  },
  getPackagePaths: () => {
    return queryPackages();
  },
  getPackageNames: () => {
    return queryPackages(true);
  }
};

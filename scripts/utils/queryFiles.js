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

function queryPackages(packageNames) {
  const gitRoot = require('./findGitRoot')();
  const lernaData = require(gitRoot + '/lerna');
  const packages = lernaData.packages;
  const results = [];
  // "packages": ["packages/*", "scripts", "apps/*", "experiments/*"],
  for (const packageRaw of packages) {
    const package = path.join(gitRoot, packageRaw.trim());
    if (package.endsWith('/*') || package.endsWith('\\*')) {
      const subRoot = package.slice(0, -2);
      const dirs = fs.readdirSync(subRoot).filter(f => fs.statSync(path.join(subRoot, f)).isDirectory());
      dirs.forEach(dir => results.push(getPackageInfo(path.join(subRoot, dir), packageNames)));
    } else {
      results.push(getPackageInfo(package, packageNames));
    }
  }
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

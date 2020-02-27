const fs = require('fs');
const path = require('path');

function queryModule(name: string, direct?: boolean): string {
  const cur = direct ? path.resolve(require.resolve(name)) : path.resolve(require.resolve(name + '/package.json'), '..');
  return fs.realpathSync(cur).replace(/\\/g, '/');
}

function getPackageInfo(subdir: string, packageName?: boolean): string | undefined {
  const normalizedPath = subdir.replace(/\\/g, '/');
  try {
    const packageJson = require(normalizedPath + '/package.json');
    return packageName ? packageJson.name : normalizedPath;
  } catch {}
  return undefined;
}

/**
 * Parse the lerna package entry and return one or more actual directories to get package info for
 * @param {string} repoRoot - path to the root of the repository
 * @param {string} packageEntry - package entry in the format of "subdir" | "subdir/*" | "subdir/**"
 */
function parseLernaPackageEntry(repoRoot: string, packageEntry: string): string[] {
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
    const results: string[] = [];
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

function queryPackages(packageNames?: boolean): string[] {
  const gitRoot = require('./findGitRoot')();
  const lernaData = require(gitRoot + '/lerna');
  const packages = lernaData.packages;

  const results = [];
  packages.forEach(packageEntry =>
    parseLernaPackageEntry(gitRoot, packageEntry).forEach(entry => results.push(getPackageInfo(entry, packageNames)))
  );
  return results.filter(p => p);
}

/**
 * Resolve a module to a true, normalized, non-symlink path
 * @param moduleName - name of the module to resolve
 */
export function resolveModule(moduleName: string): string {
  return queryModule(moduleName);
}

/**
 * Resolve a file reference to a true, normalized, non-symlink path
 * @param fileName - file to resolve
 */
export function resolveFile(fileName: string): string {
  return queryModule(fileName, true);
}

/**
 * Get an array of the package paths for packages in the repo
 */
export function getPackagePaths(): string[] {
  return queryPackages();
}

/**
 * Get an array with the package names for packages in the repo
 */
export function getPackageNames(): string[] {
  return queryPackages(true);
}

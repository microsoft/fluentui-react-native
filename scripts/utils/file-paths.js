// @ts-check

const { repoInfo, normalizePath, findGitRoot } = require('../just-repo-utils');

('use strict');
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
function nodeModulesToRoot() {
  var results = [];
  findGitRoot(cur => {
    const nodeModulePath = path.join(cur, 'node_modules');
    if (fs.existsSync(nodeModulePath)) {
      results.push(nodeModulePath.replace(/\\/g, '/'));
    }
    return false;
  });
  return results;
}
exports.nodeModulesToRoot = nodeModulesToRoot;
function queryModule(name, direct) {
  var cur = direct ? path.resolve(require.resolve(name)) : path.resolve(require.resolve(name + '/package.json'), '..');
  return fs.realpathSync(cur).replace(/\\/g, '/');
}
/**
 * Resolve a module to a true, normalized, non-symlink path
 * @param moduleName - name of the module to resolve
 */
function resolveModule(moduleName) {
  return queryModule(moduleName);
}
exports.resolveModule = resolveModule;
/**
 * Resolve a file reference to a true, normalized, non-symlink path
 * @param fileName - file to resolve
 */
function resolveFile(fileName) {
  return queryModule(fileName, true);
}
exports.resolveFile = resolveFile;

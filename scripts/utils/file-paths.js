"use strict";
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
function walkToProjectRoot(stepFn) {
    var cwd = process.cwd();
    var root = path.parse(cwd).root;
    while (cwd !== root) {
        stepFn && stepFn(cwd);
        if (fs.existsSync(path.join(cwd, '.git'))) {
            return cwd;
        }
        cwd = path.dirname(cwd);
    }
    stepFn && stepFn(cwd);
    return cwd;
}
function chainToRoot() {
    var results = [];
    walkToProjectRoot(function (cur) { return results.push(cur.replace(/\\/g, '/')); });
    return results;
}
exports.chainToRoot = chainToRoot;
function findGitRoot() {
    return walkToProjectRoot();
}
exports.findGitRoot = findGitRoot;
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

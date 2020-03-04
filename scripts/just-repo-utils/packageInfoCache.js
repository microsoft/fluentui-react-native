"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repoInfo_1 = require("./repoInfo");
const cacheUtils_1 = require("./cacheUtils");
const readConfigs_1 = require("./readConfigs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const cacheFileName = 'package-info.json';
const cachePath = cacheUtils_1.getCachePath(cacheFileName, true);
function getSerializableRepoPackages(info) {
    const results = {};
    Object.keys(info).forEach(pkgName => {
        results[pkgName] = {
            path: info[pkgName].path,
            dependencies: Object.keys(info[pkgName].dependencies)
        };
    });
    return results;
}
function getRepoPackagesFromSerializableForm(info) {
    const results = {};
    // build the initial set
    Object.keys(info).forEach(pkgName => {
        const entry = info[pkgName];
        results[pkgName] = {
            path: entry.path,
            getConfig: readConfigs_1.getConfigLoader(entry.path, 'package.json'),
            dependencies: {}
        };
    });
    // now link dependencies
    Object.keys(info).forEach(pkgName => {
        const dependencies = results[pkgName].dependencies;
        info[pkgName].dependencies.forEach(pkg => {
            dependencies[pkg] = results[pkg];
        });
    });
    return results;
}
// local storage value for calling this multiple times in the same session
let _packageInfo = undefined;
/**
 * this saves the loaded package info into a JSON cache file
 * @param pkgInfo - package info to save in a cache file
 */
function cachePackageInfo(pkgInfo) {
    const repo = repoInfo_1.repoInfo();
    const toJson = {
        hash: cacheUtils_1.getRepoHashKey(repo.rootPath),
        packages: getSerializableRepoPackages(pkgInfo)
    };
    fs_extra_1.default.writeFileSync(cachePath, JSON.stringify(toJson, null, 2));
    _packageInfo = pkgInfo;
}
exports.cachePackageInfo = cachePackageInfo;
/**
 * this attempts to load package info from a JSON cache file
 */
function retrievePackageInfo() {
    if (_packageInfo) {
        return _packageInfo;
    }
    const repo = repoInfo_1.repoInfo();
    const jsonData = readConfigs_1.readJsonConfig(cachePath);
    if (jsonData && jsonData.hash == cacheUtils_1.getRepoHashKey(repo.rootPath)) {
        return getRepoPackagesFromSerializableForm(jsonData.packages);
    }
    return undefined;
}
exports.retrievePackageInfo = retrievePackageInfo;

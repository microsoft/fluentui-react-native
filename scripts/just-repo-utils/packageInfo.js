"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repoInfo_1 = require("./repoInfo");
const readConfigs_1 = require("./readConfigs");
const normalizePath_1 = require("./normalizePath");
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const packageInfoCache_1 = require("./packageInfoCache");
function buildPackageInfo(root, pkgPath, pkgJsonName) {
    const pkgJsonPath = pkgJsonName ? path_1.default.join(root, pkgPath, pkgJsonName) : path_1.default.join(root, pkgPath);
    const getConfig = readConfigs_1.getConfigLoader(pkgJsonPath);
    return {
        [getConfig().name]: {
            path: normalizePath_1.normalizePath(path_1.default.dirname(pkgJsonPath)),
            getConfig,
            dependencies: {}
        }
    };
}
function buildPackageInfoForGlob(root, pkgGlob) {
    const matchPattern = pkgGlob + '/package.json';
    const globOptions = { cwd: root, ignore: '**/node_modules/**' };
    return Object.assign({}, ...glob_1.default.sync(matchPattern, globOptions).map(subPath => buildPackageInfo(root, subPath)));
}
function addPackageDependencyBranch(repoInfo, pkg, key) {
    const config = pkg.getConfig();
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
function addPackageDependencies(info) {
    Object.keys(info).forEach(pkg => {
        addPackageDependencyBranch(info, info[pkg], 'dependencies');
        addPackageDependencyBranch(info, info[pkg], 'devDependencies');
    });
}
function buildPackageInfoFromGlobs(root, globs) {
    const results = Object.assign({}, ...globs.map(glob => buildPackageInfoForGlob(root, glob)));
    addPackageDependencies(results);
    return results;
}
function buidlPackageInfoFromRushProjects(root, projects) {
    const results = Object.assign({}, ...projects.map(project => buildPackageInfo(root, project.projectFolder, 'package.json')));
    addPackageDependencies(results);
    return results;
}
/**
 * retrieves information about the packages in the repository
 * @param strategy - cache strategy to use for loading, defaults to normal
 */
function getPackageInfo(options) {
    const { strategy = 'normal' } = options || {};
    let repoPackageInfo = strategy === 'normal' && packageInfoCache_1.retrievePackageInfo();
    if (!repoPackageInfo) {
        const repo = repoInfo_1.repoInfo();
        if (repo.getLernaJson) {
            repoPackageInfo = buildPackageInfoFromGlobs(repo.rootPath, repo.getLernaJson().packages);
        }
        else if (repo.getRushJson) {
            repoPackageInfo = buidlPackageInfoFromRushProjects(repo.rootPath, repo.getRushJson().projects);
        }
        if (strategy !== 'no-cache' && repoPackageInfo) {
            packageInfoCache_1.cachePackageInfo(repoPackageInfo);
        }
    }
    return repoPackageInfo || {};
}
exports.getPackageInfo = getPackageInfo;
function packageInfoToPaths(info) {
    return Object.keys(info).map(pkgName => normalizePath_1.normalizePath(info[pkgName].path));
}
/**
 * Get the name of all packages that are part of this repo
 * @param options - standard package info options
 */
function getRepoPackageNames(options) {
    return Object.keys(getPackageInfo(options));
}
exports.getRepoPackageNames = getRepoPackageNames;
/**
 * Get paths for all packages that are part of this repo
 * @param options - standard package info options
 */
function getRepoPackagePaths(options) {
    return packageInfoToPaths(getPackageInfo(options));
}
exports.getRepoPackagePaths = getRepoPackagePaths;
function addRecursiveDependencies(collector, entry) {
    const dependencies = entry.dependencies;
    Object.keys(dependencies).forEach(dep => {
        if (!collector[dep]) {
            collector[dep] = dependencies[dep];
            addRecursiveDependencies(collector, dependencies[dep]);
        }
    });
}
function getDependentPackageEntries(options) {
    const target = options && options.target || readConfigs_1.readPackageJson(process.cwd()).name;
    const baseEntry = getPackageInfo(options)[target];
    const collector = {};
    if (baseEntry) {
        addRecursiveDependencies(collector, baseEntry);
    }
    return collector;
}
/**
 * return a list of dependent packages for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
function getDependentPackageNames(options) {
    return Object.keys(getDependentPackageEntries(options));
}
exports.getDependentPackageNames = getDependentPackageNames;
/**
 * return a list of dependent package paths for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
function getDependentPackagePaths(options) {
    return packageInfoToPaths(getDependentPackageEntries(options));
}
exports.getDependentPackagePaths = getDependentPackagePaths;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gitUtils_1 = require("./gitUtils");
const repoInfo_1 = require("./repoInfo");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
/**
 * Processes the list of files (or globs), returns a set, then returns hash keys for those files
 * @param rootPath - root path to base the git query
 * @param files - file scopings for matching
 */
function getFileHashes(rootPath, files) {
    const foundFiles = gitUtils_1.gitListFiles(rootPath, files);
    const hashes = gitUtils_1.gitHashObject(rootPath, foundFiles);
    return Object.assign({}, ...foundFiles.map((fileName, index) => ({
        [fileName]: hashes[index]
    })));
}
exports.getFileHashes = getFileHashes;
/**
 * Given a list of files, this:
 *  - filters the list for existence
 *  - then returns an array of modified timestamps as strings
 *
 * Note that in rough profiling on Windows this routine took ~0.5ms vs ~100ms for getFileHashes
 * for the same set of files.
 *
 * @param rootPath - root path to search for files in
 * @param files - list of files to query, note that this does not accept globs
 */
function queryTimestamps(rootPath, files) {
    return files
        .map(file => path_1.default.join(rootPath, file))
        .filter(filePath => fs_extra_1.default.existsSync(filePath))
        .map(existingFile => String(fs_extra_1.default.statSync(existingFile).mtimeMs));
}
exports.queryTimestamps = queryTimestamps;
/**
 * Get a cheap hash key for the repository structure.  Note that this is mainly for information
 * that only changes when things like the lock file, lerna.json, rush.json are modified
 *
 * @param rootPath - root of the repo
 */
function getRepoHashKey(rootPath) {
    return queryTimestamps(rootPath, ['shrinkwrap.yml', 'package-lock.json', 'yarn.lock', 'pnpmfile.js', 'rush.json', 'lerna.json']).join('-');
}
exports.getRepoHashKey = getRepoHashKey;
/**
 * Get a standard path for just cache files
 *
 * @param fileName - file name for the cache file
 * @param useRoot - if true will find the repo root, if false or omitted will work from the current working directory
 */
function getCachePath(fileName, useRoot) {
    const basePath = useRoot ? repoInfo_1.repoInfo().rootPath : process.cwd();
    return path_1.default.join(basePath, 'node_modules/.just', fileName);
}
exports.getCachePath = getCachePath;

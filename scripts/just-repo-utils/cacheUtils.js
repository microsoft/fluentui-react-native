"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gitUtils_1 = require("./gitUtils");
const repoInfo_1 = require("./repoInfo");
const path_1 = __importDefault(require("path"));
exports.lockFiles = ['shrinkwrap.yml', 'package-lock.json', 'yarn.lock', 'pnpmfile.js'];
exports.projectFiles = ['rush.json', 'lerna.json'];
function getFileHashes(rootPath, files) {
    const foundFiles = gitUtils_1.gitListFiles(rootPath, files);
    const hashes = gitUtils_1.gitHashObject(rootPath, foundFiles);
    return Object.assign({}, ...foundFiles.map((fileName, index) => ({
        [fileName]: hashes[index]
    })));
}
exports.getFileHashes = getFileHashes;
function getRepoHashKey(rootPath) {
    const hashes = gitUtils_1.gitHashObject(rootPath, gitUtils_1.gitListFiles(rootPath, [...exports.lockFiles, ...exports.projectFiles]));
    return hashes.join('-');
}
exports.getRepoHashKey = getRepoHashKey;
function getCachePath(fileName, useRoot) {
    const basePath = useRoot ? repoInfo_1.repoInfo().rootPath : process.cwd();
    return path_1.default.join(basePath, 'node_modules/.just', fileName);
}
exports.getCachePath = getCachePath;

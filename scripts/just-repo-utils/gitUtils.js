"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const repoInfo_1 = require("./repoInfo");
function cleanGitStdout(stdout) {
    return stdout
        .toString()
        .split(/\n/)
        .map(l => l.trim())
        .filter(v => v);
}
function gitListFiles(root, scope) {
    root = root || repoInfo_1.findGitRoot();
    scope = scope || [];
    const lsResults = child_process_1.spawnSync('git', ['ls-files', ...scope], { cwd: root });
    return lsResults.status !== 0 ? [] : cleanGitStdout(lsResults.stdout);
}
exports.gitListFiles = gitListFiles;
function gitHashObject(root, files) {
    root = root || repoInfo_1.findGitRoot();
    const hashResults = child_process_1.spawnSync('git', ['hash-object', ...files], { cwd: root });
    return hashResults.status !== 0 ? [] : cleanGitStdout(hashResults.stdout);
}
exports.gitHashObject = gitHashObject;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readConfigs_1 = require("./readConfigs");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
let _repoInfo = undefined;
/**
 * Everyone seems to have one of these, so this is a common implementation that can
 * be leveraged by different utilities.
 *
 * @param cb - callback function to execute at each level.  A true result for the callback will
 * cancel the walk and return the current path at the time it was cancelled.
 */
function findGitRoot(cb) {
    let cwd = process.cwd();
    const root = path_1.default.parse(cwd).root;
    while (cwd !== root) {
        if ((cb && cb(cwd)) || fs_extra_1.default.existsSync(path_1.default.join(cwd, '.git'))) {
            return cwd;
        }
        cwd = path_1.default.dirname(cwd);
    }
    throw 'No repository root found!';
}
exports.findGitRoot = findGitRoot;
/**
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds the git root and then prepare loaders for various monorepo config files
 */
function repoInfo() {
    if (_repoInfo) {
        return _repoInfo;
    }
    const rootPath = findGitRoot();
    const getRushJson = readConfigs_1.getConfigLoader(rootPath, 'rush.json', readConfigs_1.loadCJson);
    const getLernaJson = readConfigs_1.getConfigLoader(rootPath, 'lerna.json');
    const isMonoRepo = getRushJson || getLernaJson;
    _repoInfo = Object.assign({ rootPath: rootPath, getRushJson,
        getLernaJson, getPackageJson: readConfigs_1.getConfigLoader(rootPath, 'package.json') }, (isMonoRepo && { monorepo: getRushJson ? 'rush' : 'lerna' }));
    return _repoInfo;
}
exports.repoInfo = repoInfo;

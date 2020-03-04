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
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds a lerna.json, rush.json, or the git root.
 */
function repoInfo() {
    if (_repoInfo) {
        return _repoInfo;
    }
    let cwd = process.cwd();
    const root = path_1.default.parse(cwd).root;
    while (cwd !== root) {
        // walk up to the git root
        if (fs_extra_1.default.existsSync(path_1.default.join(cwd, '.git'))) {
            const getRushJson = readConfigs_1.getConfigLoader(cwd, 'rush.json', readConfigs_1.loadCJson);
            const getLernaJson = readConfigs_1.getConfigLoader(cwd, 'lerna.json');
            const isMonoRepo = getRushJson || getLernaJson;
            _repoInfo = Object.assign({ rootPath: cwd, getRushJson,
                getLernaJson, getPackageJson: readConfigs_1.getConfigLoader(cwd, 'package.json') }, (isMonoRepo && { monorepo: getRushJson ? 'rush' : 'lerna' }));
            return _repoInfo;
        }
        cwd = path_1.default.dirname(cwd);
    }
    throw ('No repository root found!');
}
exports.repoInfo = repoInfo;

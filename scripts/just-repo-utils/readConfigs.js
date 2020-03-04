"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const just_task_logger_1 = require("just-task-logger");
/** default JSON load implementation */
function loadJson(pkgPath) {
    try {
        return fs_extra_1.default.readJsonSync(pkgPath);
    }
    catch (e) {
        // this emits a warning for the bad file, then returns null (though that is against the return
        // signature)  This allows a caller to handle null but will mimic { throws: false } behavior
        just_task_logger_1.logger.warn(`Invalid ${pkgPath.split(path_1.default.sep).pop()} detected.`);
        return undefined;
    }
}
exports.loadJson = loadJson;
/** loader implementation for CJSON */
function loadCJson(pkgPath) {
    const jju = require('jju');
    try {
        const fileAsString = fs_extra_1.default.readFileSync(pkgPath, 'utf8').toString();
        return jju.parse(fileAsString, { mode: 'cjson' });
    }
    catch (e) {
        // this emits a warning for the bad file, then returns null (though that is against the return
        // signature)  This allows a caller to handle null but will mimic { throws: false } behavior
        just_task_logger_1.logger.warn(`Invalid ${pkgPath.split(path_1.default.sep).pop()} detected.`);
        return undefined;
    }
}
exports.loadCJson = loadCJson;
/**
 * A wrapper around checking if a file exists and executing an action on it if it does.  Otherwise returning
 * undefined.
 *
 * @param folder - folder path to use as the base of the config search
 * @param name - package name, if undefined or falsy the package is assumed to be included in the folder
 * @param cb - callback function to execute if the file exists
 */
function ifConfig(folder, name, cb) {
    const pkgPath = name ? path_1.default.join(folder, name) : folder;
    if (fs_extra_1.default.existsSync(pkgPath)) {
        return cb(pkgPath);
    }
    return undefined;
}
/**
 * Reads and parses a configuration file from the given folder.  Will return undefined if not found.
 * @param folder - The folder path to query for the config file
 * @param name - name of the config file, if omitted the file is assumed to already be in folder
 */
function readJsonConfig(folder, name, onLoad) {
    onLoad = onLoad || loadJson;
    return ifConfig(folder, name, loadJson);
}
exports.readJsonConfig = readJsonConfig;
/**
 * If a file exists, return a config loader function that can be used to load the file at a later
 * time.  If the file doesn't exist will return undefined.  The closure includes storage
 * such that if the file is loaded the results will be cached.  Subsequent calls will use cached results
 *
 * If the file is to be modified this will need to be recalculated via a different method
 *
 * @param folder - The folder path to query for the config file
 * @param name - name of the config file, if omitted the file is assume to be included in folder
 */
function getConfigLoader(folder, name, onLoad) {
    onLoad = onLoad || loadJson;
    return ifConfig(folder, name, pkgPath => {
        let _storage = undefined;
        return () => {
            if (!_storage) {
                _storage = fs_extra_1.default.readJsonSync(pkgPath, { throws: false });
            }
            return _storage;
        };
    });
}
exports.getConfigLoader = getConfigLoader;
/**
 * Read a package json file
 * @param folder - folder path for the package.json
 */
function readPackageJson(folder) {
    return readJsonConfig(folder, 'package.json');
}
exports.readPackageJson = readPackageJson;

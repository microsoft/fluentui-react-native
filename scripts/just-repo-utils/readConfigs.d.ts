import { PackageJson, ConfigLoader } from './interfaces/configTypes';
declare type LoaderFn<T> = (pkgPath: string) => T;
/** default JSON load implementation */
export declare function loadJson<T = object>(pkgPath: string): T;
/** loader implementation for CJSON */
export declare function loadCJson<T = object>(pkgPath: string): T;
/**
 * Reads and parses a configuration file from the given folder.  Will return undefined if not found.
 * @param folder - The folder path to query for the config file
 * @param name - name of the config file, if omitted the file is assumed to already be in folder
 */
export declare function readJsonConfig<T = object>(folder: string, name?: string, onLoad?: LoaderFn<T>): T | undefined;
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
export declare function getConfigLoader<T = object>(folder: string, name?: string, onLoad?: LoaderFn<T>): ConfigLoader<T> | undefined;
/**
 * Read a package json file
 * @param folder - folder path for the package.json
 */
export declare function readPackageJson(folder: string): PackageJson | undefined;
export {};
//# sourceMappingURL=readConfigs.d.ts.map
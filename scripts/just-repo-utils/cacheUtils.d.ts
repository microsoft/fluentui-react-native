/**
 * Processes the list of files (or globs), returns a set, then returns hash keys for those files
 * @param rootPath - root path to base the git query
 * @param files - file scopings for matching
 */
export declare function getFileHashes(rootPath: string, files: string[]): {
    [file: string]: string;
};
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
export declare function queryTimestamps(rootPath: string, files: string[]): string[];
/**
 * Get a cheap hash key for the repository structure.  Note that this is mainly for information
 * that only changes when things like the lock file, lerna.json, rush.json are modified
 *
 * @param rootPath - root of the repo
 */
export declare function getRepoHashKey(rootPath: string): string;
/**
 * Get a standard path for just cache files
 *
 * @param fileName - file name for the cache file
 * @param useRoot - if true will find the repo root, if false or omitted will work from the current working directory
 */
export declare function getCachePath(fileName: string, useRoot?: boolean): string;
//# sourceMappingURL=cacheUtils.d.ts.map
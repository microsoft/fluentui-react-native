import { PackageInfo } from './interfaces/packageInfoTypes';
/**
 * this saves the loaded package info into a JSON cache file
 * @param pkgInfo - package info to save in a cache file
 */
export declare function cachePackageInfo(pkgInfo: PackageInfo): void;
/**
 * this attempts to load package info from a JSON cache file
 */
export declare function retrievePackageInfo(): PackageInfo | undefined;
//# sourceMappingURL=packageInfoCache.d.ts.map
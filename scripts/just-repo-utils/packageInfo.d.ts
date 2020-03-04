import { PackageInfo, PackageInfoOptions } from './interfaces/packageInfoTypes';
/**
 * retrieves information about the packages in the repository
 * @param strategy - cache strategy to use for loading, defaults to normal
 */
export declare function getPackageInfo(options?: PackageInfoOptions): PackageInfo;
/**
 * Get the name of all packages that are part of this repo
 * @param options - standard package info options
 */
export declare function getRepoPackageNames(options?: PackageInfoOptions): string[];
/**
 * Get paths for all packages that are part of this repo
 * @param options - standard package info options
 */
export declare function getRepoPackagePaths(options?: PackageInfoOptions): string[];
/**
 * return a list of dependent packages for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
export declare function getDependentPackageNames(options?: PackageInfoOptions): string[];
/**
 * return a list of dependent package paths for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
export declare function getDependentPackagePaths(options?: PackageInfoOptions): string[];
//# sourceMappingURL=packageInfo.d.ts.map
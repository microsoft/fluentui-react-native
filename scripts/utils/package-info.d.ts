/**
 * Get an array of the package paths for packages in the repo
 */
export declare function getPackagePaths(): string[];
/**
 * Get an array with the package names for packages in the repo
 */
export declare function getPackageNames(): string[];

export declare interface IDependentPackageOptions {
  name?: string;
  paths?: boolean;
}
export declare function getDependentPackages(options?: IDependentPackageOptions): string[];

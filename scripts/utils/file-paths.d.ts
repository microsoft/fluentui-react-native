export declare function chainToRoot(): string[];
export declare function findGitRoot(): string;
/**
 * Resolve a module to a true, normalized, non-symlink path
 * @param moduleName - name of the module to resolve
 */
export declare function resolveModule(moduleName: string): string;
/**
 * Resolve a file reference to a true, normalized, non-symlink path
 * @param fileName - file to resolve
 */
export declare function resolveFile(fileName: string): string;

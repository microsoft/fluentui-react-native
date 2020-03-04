export declare const lockFiles: string[];
export declare const projectFiles: string[];
export declare function getFileHashes(rootPath: string, files: string[]): {
    [file: string]: string;
};
export declare function getRepoHashKey(rootPath: string): string;
export declare function getCachePath(fileName: string, useRoot?: boolean): string;
//# sourceMappingURL=cacheUtils.d.ts.map
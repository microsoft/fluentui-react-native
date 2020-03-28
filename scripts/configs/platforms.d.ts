export declare type PlatformValue = 'win32' | 'ios' | 'android' | 'windows' | 'web' | 'macos' | 'default';
export declare function getRNVersion(platform?: PlatformValue): string;
export declare function getAllRNVersions(): string[];
export declare function getAllPlatforms(): string[];
export declare function findPlatform(): PlatformValue;
export declare function ensurePlatform(platform?: PlatformValue): PlatformValue;
export declare function findReactNativePackage(): string;

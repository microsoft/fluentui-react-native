export declare type PlatformValue = 'win32' | 'ios' | 'android' | 'windows' | 'web' | 'macos';
export interface IMetroOptions {
    /**
     * bundle name, potentially used to keep caches distinct
     */
    bundle?: string;
    /**
     * which platforms should this bundle target, either a single string or an array
     */
    platform?: PlatformValue;
}
/**
 * This configures metro bundling based on the passed in options.
 *
 * @param options - metro configuration options
 */
export declare function configureMetro(options: IMetroOptions): any;

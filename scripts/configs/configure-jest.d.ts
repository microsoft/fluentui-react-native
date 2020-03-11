import { PlatformValue } from './platforms';
/**
 * Configure jest for general purpose TS packages
 * @param customConfig - custom jest configuration to mix in
 */
export declare function configureJest(customConfig?: any): any;
/**
 *
 * @param platform - which platform to target for this test run
 * @param customConfig - optional custom configuration to mix in
 */
export declare function configureReactNativeJest(platform?: PlatformValue, customConfig?: any): any;

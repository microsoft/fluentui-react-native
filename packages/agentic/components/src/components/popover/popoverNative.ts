import type { PopoverNativeHost } from './popoverNative.types';

/**
 * Hosts without native-core's modern popup route. Office Win32 awaits the native-core adapter (#4384), and mobile
 * platforms are unsupported; Popover throws a descriptive error on these hosts.
 */
export const popoverNativeHost: PopoverNativeHost | undefined = undefined;

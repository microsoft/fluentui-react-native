import type { MenuNativeHost } from './menuNative.types';

/**
 * Hosts without native-core's modern popup route. Office Win32 awaits the native-core adapter (#4384), and mobile
 * platforms are unsupported; Menu throws a descriptive error on these hosts.
 */
export const menuNativeHost: MenuNativeHost | undefined = undefined;

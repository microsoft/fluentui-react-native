import type { MenuNativeHost } from './menuNative.types';

/**
 * Hosts without a native-core popup route. Mobile platforms are unsupported; Menu throws a descriptive error on these
 * hosts.
 */
export const menuNativeHost: MenuNativeHost | undefined = undefined;

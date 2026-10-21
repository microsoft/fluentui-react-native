import type { DropdownNativeHost } from './dropdownNative.types';

/**
 * Hosts without a native-core popup route. Mobile platforms are unsupported; Dropdown throws a descriptive error on
 * these hosts.
 */
export const dropdownNativeHost: DropdownNativeHost | undefined = undefined;

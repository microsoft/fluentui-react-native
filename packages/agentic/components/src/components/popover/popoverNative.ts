import type { PopoverNativeHost } from './popoverNative.types';

/** Hosts without a native-core popup route. Mobile platforms are unsupported; Popover throws a descriptive error. */
export const popoverNativeHost: PopoverNativeHost | undefined = undefined;

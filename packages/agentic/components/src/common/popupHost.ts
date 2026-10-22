import type { PopupHost } from './popupHost.types';

/**
 * Hosts without a native-core popup route. Mobile platforms are unsupported; popup components throw a descriptive error
 * on these hosts.
 */
export const popupHost: PopupHost | undefined = undefined;

/**
 * macOS defaults: AppKit menus skip disabled commands, and AppKit has no public submenu delay, so these delays
 * approximate native menus without pointer-travel intent.
 */
export const menuPlatformDefaults = {
  disabledFocusable: false,
  submenuOpenDelay: 100,
  submenuCloseDelay: 300,
};

/**
 * Windows and Win32 defaults: disabled commands stay focusable, as in their native menus, and submenus use the
 * system menu show delay's shipped value until native-core surfaces the user setting.
 */
export const menuPlatformDefaults = {
  disabledFocusable: true,
  submenuOpenDelay: 400,
  submenuCloseDelay: 400,
};

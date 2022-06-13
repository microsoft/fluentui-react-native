/* Accessibility Role Control Types - https://docs.microsoft.com/en-us/windows/win32/winauto/uiauto-controltype-ids */
export const BUTTON_A11Y_ROLE = 'ControlType.Button';
export const CALLOUT_A11Y_ROLE = 'ControlType.Group';
export const CHECKBOX_A11Y_ROLE = 'ControlType.CheckBox';
export const LINK_A11Y_ROLE = 'ControlType.HyperLink';
export const MENUBUTTON_A11Y_ROLE = 'ControlType.Button';
export const MENU_A11Y_ROLE = 'ControlType.Menu';
export const MENUITEM_A11Y_ROLE = 'ControlType.MenuItem';
export const RADIOBUTTON_A11Y_ROLE = 'ControlType.RadioButton';
export const RADIOGROUP_A11Y_ROLE = 'ControlType.List';
export const TAB_A11Y_ROLE = 'ControlType.Tab';
export const TABITEM_A11Y_ROLE = 'ControlType.TabItem';
export const TEXT_A11Y_ROLE = 'ControlType.Text';

/* Jasmine Timeouts */
export const BOOT_APP_TIMEOUT = 60000;
export const PAGE_TIMEOUT = 15000;

/* Keyboard Key Constants */
export const enum Keys {
  Up_Arrow = 'ArrowUp',
  Right_Arrow = 'ArrowRight',
  Down_Arrow = 'ArrowDown',
  Left_Arrow = 'ArrowLeft',
  Spacebar = ' ',
  Enter = 'Enter',
  Escape = 'Escape',
}

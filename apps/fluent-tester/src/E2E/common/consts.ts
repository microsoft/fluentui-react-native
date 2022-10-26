export const ROOT_VIEW = 'Fluent_Tester_Root_View';

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

export const enum Attribute {
  AccessibilityLabel = 'Name',
  AccessibilityRole = 'ControlType',
  ExpandCollapseState = 'ExpandCollapse.ExpandCollapseState',
  IsEnabled = 'IsEnabled',
  IsFocused = 'HasKeyboardFocus',
  IsRequiredForForm = 'IsRequiredForForm',
  IsTogglePatternAvailable = 'IsTogglePatternAvailable',
  ToggleState = 'Toggle.ToggleState',
}

export const enum AttributeValue {
  on = '1',
  off = '0',
  true = 'True',
  false = 'False',
}

/* Keyboard Key Constants */
export const enum Keys {
  NULL = '\uE000',
  CANCEL = '\uE001', // ^break
  HELP = '\uE002',
  BACK_SPACE = '\uE003',
  TAB = '\uE004',
  CLEAR = '\uE005',
  RETURN = '\uE006',
  ENTER = '\uE007',
  SHIFT = '\uE008',
  CONTROL = '\uE009',
  ALT = '\uE00A',
  PAUSE = '\uE00B',
  ESCAPE = '\uE00C',
  SPACE = '\uE00D',
  PAGE_UP = '\uE00E',
  PAGE_DOWN = '\uE00F',
  END = '\uE010',
  HOME = '\uE011',
  ARROW_LEFT = '\uE012',
  LEFT = '\uE012',
  ARROW_UP = '\uE013',
  UP = '\uE013',
  ARROW_RIGHT = '\uE014',
  RIGHT = '\uE014',
  ARROW_DOWN = '\uE015',
  DOWN = '\uE015',
  INSERT = '\uE016',
  DELETE = '\uE017',
  SEMICOLON = '\uE018',
  EQUALS = '\uE019',

  NUMPAD0 = '\uE01A', // number pad keys
  NUMPAD1 = '\uE01B',
  NUMPAD2 = '\uE01C',
  NUMPAD3 = '\uE01D',
  NUMPAD4 = '\uE01E',
  NUMPAD5 = '\uE01F',
  NUMPAD6 = '\uE020',
  NUMPAD7 = '\uE021',
  NUMPAD8 = '\uE022',
  NUMPAD9 = '\uE023',
  MULTIPLY = '\uE024',
  ADD = '\uE025',
  SEPARATOR = '\uE026',
  SUBTRACT = '\uE027',
  DECIMAL = '\uE028',
  DIVIDE = '\uE029',

  F1 = '\uE031', // function keys
  F2 = '\uE032',
  F3 = '\uE033',
  F4 = '\uE034',
  F5 = '\uE035',
  F6 = '\uE036',
  F7 = '\uE037',
  F8 = '\uE038',
  F9 = '\uE039',
  F10 = '\uE03A',
  F11 = '\uE03B',
  F12 = '\uE03C',
}

export const enum ExpandCollapseState {
  EXPANDED = 'Expanded',
  COLLAPSED = 'Collapsed',
}

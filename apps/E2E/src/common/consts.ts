export const ROOT_VIEW = 'Fluent_Tester_Root_View';
export const E2E_MODE_SWITCH = 'E2E_Mode_Switch';
export const E2E_TEST_SECTION = 'E2E_Test_Section';

/* Accessibility Role Control Types - https://docs.microsoft.com/en-us/windows/win32/winauto/uiauto-controltype-ids */
export const BUTTON_A11Y_ROLE = 'ControlType.Button';
export const CALLOUT_A11Y_ROLE = 'ControlType.Group';
export const CHECKBOX_A11Y_ROLE = 'ControlType.CheckBox';
export const IMAGE_A11Y_ROLE = 'ControlType.Image';
export const LINK_A11Y_ROLE = 'ControlType.HyperLink';
export const MENUBUTTON_A11Y_ROLE = 'ControlType.Button';
export const MENU_A11Y_ROLE = 'ControlType.Menu';
export const MENUITEM_A11Y_ROLE = 'ControlType.MenuItem';
export const RADIOBUTTON_A11Y_ROLE = 'ControlType.RadioButton';
export const RADIOGROUP_A11Y_ROLE = 'ControlType.List';
export const TAB_A11Y_ROLE = 'ControlType.Tab';
export const TABITEM_A11Y_ROLE = 'ControlType.TabItem';
export const TEXT_A11Y_ROLE = 'ControlType.Text';

/* Android Widget Class Types - https://developer.android.com/reference/android/widget/package-summary#classes */
export const ANDROID_BUTTON = 'android.widget.Button';
export const ANDROID_CHECKBOX = 'android.widget.CheckBox';
export const ANDROID_IMAGE = 'android.widget.ImageView';
export const ANDROID_TEXT = 'android.widget.TextView';
export const ANDROID_RADIOBUTTON = 'android.widget.RadioButton';
export const ANDROID_EDITTEXT = 'android.widget.EditText';

/* Jasmine Timeouts */
export const BOOT_APP_TIMEOUT = 60000;
export const PAGE_TIMEOUT = 15000;

// eslint-disable-next-line @rnx-kit/no-const-enum
export const enum Attribute {
  AccessibilityHint = 'HelpText',
  AccessibilityLabel = 'Name',
  AccessibilityRole = 'ControlType',
  ExpandCollapseState = 'ExpandCollapse.ExpandCollapseState',
  IsEnabled = 'IsEnabled',
  IsFocused = 'HasKeyboardFocus',
  IsRequiredForForm = 'IsRequiredForForm',
  IsTogglePatternAvailable = 'IsTogglePatternAvailable',
  TestID = 'AutomationId',
  ToggleState = 'Toggle.ToggleState',
}

/* Android Element Attributes - https://github.com/appium/appium-uiautomator2-driver#element-attributes */
// eslint-disable-next-line @rnx-kit/no-const-enum
export const enum AndroidAttribute {
  AccessibilityLabel = 'content-desc',
  Class = 'class',
  Clickable = 'clickable',
  Checked = 'checked',
  Text = 'text',
}

export const attributeToEnumName = {
  [Attribute.AccessibilityHint]: 'AccessibilityHint',
  [Attribute.AccessibilityLabel]: 'AccessibilityLabel',
  [Attribute.AccessibilityRole]: 'AccessibilityRole',
  [Attribute.ExpandCollapseState]: 'ExpandCollapseState',
  [Attribute.IsEnabled]: 'IsEnabled',
  [Attribute.IsFocused]: 'IsFocused',
  [Attribute.IsRequiredForForm]: 'IsRequiredForForm',
  [Attribute.IsTogglePatternAvailable]: 'IsTogglePatternAvailable',
  [Attribute.TestID]: 'TestID',
  [Attribute.ToggleState]: 'ToggleState',
};

export const androidAttributeToEnumName = {
  [AndroidAttribute.AccessibilityLabel]: 'content-desc',
  [AndroidAttribute.Class]: 'class',
  [AndroidAttribute.Clickable]: 'clickable',
  [AndroidAttribute.Checked]: 'checked',
  [AndroidAttribute.Text]: 'text',
};

// eslint-disable-next-line @rnx-kit/no-const-enum
export const enum AttributeValue {
  on = '1',
  off = '0',
  true = 'True',
  false = 'False',
  expanded = 'Expanded',
  collapsed = 'Collapsed',
}

/* Keyboard Key Constants */
// eslint-disable-next-line @rnx-kit/no-const-enum
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

// Used for E2E testing on base page of FluentTester
export const BASE_TESTPAGE = 'Base_TestPage';

// ScrollViewer that contains the list of test page buttons
export const TESTPAGE_BUTTONS_SCROLLVIEWER = 'TestPage_Buttons_ScrollViewer';

// ScrollViewer that contains the content of each test page
export const TESTPAGE_CONTENT_SCROLLVIEWER = 'TestPage_Content_ScrollViewer';

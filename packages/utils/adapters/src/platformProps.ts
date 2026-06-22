import type RN from 'react-native';
import type { NativeSyntheticEvent } from 'react-native';

/**
 * Platform-neutral redeclarations of the prop/style extensions that the React Native forks
 * (`react-native-windows`, `react-native-macos`, `@office-iss/react-native-win32`) add on top of
 * the base `react-native` types.
 *
 * These are intentionally declared here WITHOUT importing the fork packages so that nothing
 * reachable from the package entrypoint pulls multiple react-native forks into a single program
 * (which causes non-deterministic type "confusion" in the unified build). The fork packages are
 * referenced only from the isolated drift tests under `src/__drift__`, which fail to compile if
 * these redeclarations fall out of alignment with the real fork types.
 *
 * The per-platform `*Additions` interfaces below mirror exactly the keys each platform's filter mask
 * adds on top of the base mask, so `RN.<Element>Props & <Platform><Element>Additions` reproduces the
 * fork's prop key set. Event payloads are unified across platforms (a superset) rather than
 * redeclared per-fork; only the prop KEYS need to match the forks.
 */

// --- Shared event payloads (superset across platforms) -------------------------------------------

export interface INativeKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  code?: string;
}

export type IKeyboardEvent = NativeSyntheticEvent<INativeKeyboardEvent>;
export type IKeyboardEventHandler = (args: IKeyboardEvent) => void;

/**
 * A key descriptor accepted by `keyDownEvents`/`keyUpEvents`. Superset of the macOS `HandledKeyEvent`
 * plus the Windows/Win32 `code`/`eventPhase` fields.
 */
export interface HandledKeyEvent {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: string;
  code?: string;
  // 0 = None, 1 = Capturing, 2 = AtTarget, 3 = Bubbling (react-native-windows EventPhase)
  eventPhase?: 0 | 1 | 2 | 3;
}

export type NativeKeyEvent = NativeSyntheticEvent<HandledKeyEvent>;
export type KeyEventHandler = (event: NativeKeyEvent) => void;

export type IMouseEvent = NativeSyntheticEvent<object>;
export type IMouseEventHandler = (args: IMouseEvent) => void;

export type IFocusEvent = NativeSyntheticEvent<object>;
export type IFocusEventHandler = (ev: IFocusEvent) => void;

export type IDragEvent = NativeSyntheticEvent<object>;
export type IDragEventHandler = (args: IDragEvent) => void;

export type AccessibilityAnnotationInfo = Readonly<{
  typeID: string;
  typeName?: string;
  author?: string;
  dateTime?: string;
  target?: string;
  replyCount?: number;
}>;

export type CursorValue = 'auto' | 'pointer';

export type DraggedType = 'fileUrl' | 'image' | 'string';
export type DraggedTypesType = DraggedType | DraggedType[];

export type TextWin32TextStyle =
  | 'None'
  | 'SmallStandard'
  | 'SmallSecondary'
  | 'MediumStandard'
  | 'MediumSecondary'
  | 'MediumApp'
  | 'MediumBold'
  | 'MediumBoldApp'
  | 'LargeStandard'
  | 'LargePlusStandard'
  | 'ExtraLargeStandard'
  | 'HugeStandard';

// --- Win32 (@office-iss/react-native-win32) additions --------------------------------------------

export interface ViewAdditionsWin32 {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityControls?: string;
  accessibilityDescribedBy?: string;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPositionInSet?: number;
  accessibilitySetSize?: number;
  animationClass?: string;
  cursor?: CursorValue;
  enableFocusRing?: boolean;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];
  onBlurCapture?: IFocusEventHandler;
  onFocusCapture?: IFocusEventHandler;
  onKeyDown?: IKeyboardEventHandler;
  onKeyDownCapture?: IKeyboardEventHandler;
  onKeyUp?: IKeyboardEventHandler;
  onKeyUpCapture?: IKeyboardEventHandler;
  onMouseEnter?: IMouseEventHandler;
  onMouseLeave?: IMouseEventHandler;
  tooltip?: string;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-multiselectable'?: boolean;
  'aria-posinset'?: number;
  'aria-required'?: boolean;
  'aria-setsize'?: number;
}

export interface TextAdditionsWin32 {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityControls?: string;
  accessibilityDescribedBy?: string;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPositionInSet?: number;
  accessibilitySetSize?: number;
  focusable?: boolean;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];
  onBlur?: IFocusEventHandler;
  onBlurCapture?: IFocusEventHandler;
  onFocus?: IFocusEventHandler;
  onFocusCapture?: IFocusEventHandler;
  onKeyDown?: IKeyboardEventHandler;
  onKeyDownCapture?: IKeyboardEventHandler;
  onKeyUp?: IKeyboardEventHandler;
  onKeyUpCapture?: IKeyboardEventHandler;
  textStyle?: TextWin32TextStyle;
  tooltip?: string;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-multiselectable'?: boolean;
  'aria-posinset'?: number;
  'aria-required'?: boolean;
  'aria-setsize'?: number;
}

export interface ImageAdditionsWin32 {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityControls?: string;
  accessibilityDescribedBy?: string;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPositionInSet?: number;
  accessibilitySetSize?: number;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-multiselectable'?: boolean;
  'aria-posinset'?: number;
  'aria-required'?: boolean;
  'aria-setsize'?: number;
}

// --- Windows (react-native-windows) additions ----------------------------------------------------

export interface ViewAdditionsWindows {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPosInSet?: number;
  accessibilitySetSize?: number;
  enableFocusRing?: boolean;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];
  onKeyDown?: IKeyboardEventHandler;
  onKeyDownCapture?: IKeyboardEventHandler;
  onKeyUp?: IKeyboardEventHandler;
  onKeyUpCapture?: IKeyboardEventHandler;
  onMouseEnter?: IMouseEventHandler;
  onMouseLeave?: IMouseEventHandler;
  tooltip?: string;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

export interface TextAdditionsWindows {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPosInSet?: number;
  accessibilitySetSize?: number;
  disabled?: boolean;
  textBreakStrategy?: 'simple' | 'highQuality' | 'balanced';
  tooltip?: string;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

export interface ImageAdditionsWindows {
  accessibilityAccessKey?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityDescription?: string;
  accessibilityItemType?: string;
  accessibilityLevel?: number;
  accessibilityPosInSet?: number;
  accessibilitySetSize?: number;
  'aria-description'?: string;
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

// --- macOS (react-native-macos) additions --------------------------------------------------------

export interface ViewAdditionsMacOS {
  acceptsFirstMouse?: boolean;
  allowsVibrancy?: boolean;
  draggedTypes?: DraggedTypesType;
  enableFocusRing?: boolean;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];
  mouseDownCanMoveWindow?: boolean;
  onDoubleClick?: IMouseEventHandler;
  onDragEnter?: IDragEventHandler;
  onDragLeave?: IDragEventHandler;
  onDrop?: IDragEventHandler;
  onKeyDown?: IKeyboardEventHandler;
  onKeyUp?: IKeyboardEventHandler;
  onMouseEnter?: IMouseEventHandler;
  onMouseLeave?: IMouseEventHandler;
  onPreferredScrollerStyleDidChange?: (event: NativeSyntheticEvent<object>) => void;
  passthroughAllKeyEvents?: boolean;
  tooltip?: string;
  // macOS `validKeysDown`/`validKeysUp` are arrays of key names (e.g. "Enter", " "), not key events.
  validKeysDown?: string[];
  validKeysUp?: string[];
}

export interface TextAdditionsMacOS {
  disabled?: boolean;
  enableFocusRing?: boolean;
  focusable?: boolean;
  onMouseEnter?: IMouseEventHandler;
  onMouseLeave?: IMouseEventHandler;
  textBreakStrategy?: 'simple' | 'highQuality' | 'balanced';
  tooltip?: string;
}

export interface ImageAdditionsMacOS {
  tooltip?: string;
}

// --- Full per-platform prop types (used by the filter masks; key set mirrors each fork) ----------

export type ViewPropsWin32 = RN.ViewProps & ViewAdditionsWin32;
export type ViewPropsWindows = RN.ViewProps & ViewAdditionsWindows;
export type ViewPropsMacOS = RN.ViewProps & ViewAdditionsMacOS;

export type TextPropsWin32 = RN.TextProps & TextAdditionsWin32;
export type TextPropsWindows = RN.TextProps & TextAdditionsWindows;
export type TextPropsMacOS = RN.TextProps & TextAdditionsMacOS;

export type ImagePropsWin32 = RN.ImageProps & ImageAdditionsWin32;
export type ImagePropsWindows = RN.ImageProps & ImageAdditionsWindows;
export type ImagePropsMacOS = RN.ImageProps & ImageAdditionsMacOS;

// --- Combined additions (used to build the cross-platform consumer types) ------------------------

export type ViewAdditions = ViewAdditionsWin32 & ViewAdditionsWindows & ViewAdditionsMacOS;
export type TextAdditions = TextAdditionsWin32 & TextAdditionsWindows & TextAdditionsMacOS;
export type ImageAdditions = ImageAdditionsWin32 & ImageAdditionsWindows & ImageAdditionsMacOS;

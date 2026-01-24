import type { TextProps, ViewProps, ImageProps, NativeSyntheticEvent } from 'react-native';

export interface INativeKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
}
export type IKeyboardEvent = NativeSyntheticEvent<INativeKeyboardEvent>;

type PartiallyRequired<T, Keys extends keyof T = keyof T> = Pick<Partial<T>, Exclude<keyof T, Keys>> & Pick<T, Keys>;

export type IHandledKeyboardEvent = PartiallyRequired<INativeKeyboardEvent, 'key'> & {
  eventPhase?: 0 | 1 | 2 | 3;
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/UIEvent
 */
export interface NativeUIEvent {
  /**
   * Returns a long with details about the event, depending on the event type.
   */
  readonly detail: number;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export interface NativeMouseEvent extends NativeUIEvent {
  /**
   * The X coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenX: number;
  /**
   * The Y coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenY: number;
  /**
   * The X coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageX: number;
  /**
   * The Y coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageY: number;
  /**
   * The X coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientX: number;
  /**
   * The Y coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientY: number;
  /**
   * Alias for NativeMouseEvent.clientX
   */
  readonly x: number;
  /**
   * Alias for NativeMouseEvent.clientY
   */
  readonly y: number;
  /**
   * Returns true if the control key was down when the mouse event was fired.
   */
  readonly ctrlKey: boolean;
  /**
   * Returns true if the shift key was down when the mouse event was fired.
   */
  readonly shiftKey: boolean;
  /**
   * Returns true if the alt key was down when the mouse event was fired.
   */
  readonly altKey: boolean;
  /**
   * Returns true if the meta key was down when the mouse event was fired.
   */
  readonly metaKey: boolean;
  /**
   * The button number that was pressed (if applicable) when the mouse event was fired.
   */
  readonly button: number;
  /**
   * The buttons being depressed (if any) when the mouse event was fired.
   */
  readonly buttons: number;
  /**
   * The secondary target for the event, if there is one.
   * Type is compatible with both old (Component & NativeMethods) and new (NativeMethods) React Native versions.
   */
  readonly relatedTarget: null | number | any;
  // offset is proposed: https://drafts.csswg.org/cssom-view/#extensions-to-the-mouseevent-interface
  /**
   * The X coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetX: number;
  /**
   * The Y coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetY: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

export type MouseEvent = NativeSyntheticEvent<NativeMouseEvent>;

export type Cursor =
  | 'auto'
  | 'default'
  | 'pointer'
  | 'help'
  | 'not-allowed'
  | 'wait'
  | 'move'
  | 'nesw-resize'
  | 'ns-resize'
  | 'nwse-resize'
  | 'we-resize'
  | 'text';

// [Win32]
export type AnnotationType =
  | 'AdvanceProofingIssue'
  | 'Author'
  | 'CircularReferenceError'
  | 'Comment'
  | 'ConflictingChange'
  | 'DataValidationError'
  | 'DeletionChange'
  | 'EditingLockedChange'
  | 'Endnote'
  | 'ExternalChange'
  | 'Footer'
  | 'Footnote'
  | 'FormatChange'
  | 'FormulaError'
  | 'GrammarError'
  | 'Header'
  | 'Highlighted'
  | 'InsertionChange'
  | 'Mathematics'
  | 'MoveChange'
  | 'SpellingError'
  | 'TrackChanges'
  | 'Unknown'
  | 'UnsyncedChange';

// [Win32]
export type AccessibilityAnnotationInfo = Readonly<{
  typeID: AnnotationType;
  typeName?: string;
  author?: string;
  dateTime?: string;
  target?: string;
}>;

export type IAdapterWin32ViewProps = ViewProps & {
  onKeyDown?: (args: IKeyboardEvent) => void;
  onKeyDownCapture?: (args: IKeyboardEvent) => void;
  onKeyUp?: (args: IKeyboardEvent) => void;
  onKeyUpCapture?: (args: IKeyboardEvent) => void;

  keyDownEvents?: IHandledKeyboardEvent[];
  keyUpEvents?: IHandledKeyboardEvent[];

  onMouseLeave?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;

  tooltip?: string;
  tabIndex?: number;
  enableFocusRing?: boolean;
  onBlur?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onBlurCapture?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onFocus?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onFocusCapture?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  cursor?: Cursor;
  animationClass?: string;
  focusable?: boolean;

  'aria-multiselectable'?: boolean | undefined;
  'aria-required'?: boolean | undefined;
  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-description'?: string | undefined;
  'aria-level'?: number | undefined;
  'aria-controls'?: string | undefined;
  'aria-describedby'?: string | undefined;

  accessibilitySetSize?: number;
  accessibilityPositionInSet?: number;
  accessibilityDescription?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityAccessKey?: string;
  accessibilityLevel?: number;
  accessibilityItemType?: string;
  accessibilityControls?: string | undefined;
  accessibilityDescribedBy?: string | undefined;

  // Added in newer React Native versions for iOS/macOS compatibility
  screenReaderFocusable?: boolean;
  accessibilityShowsLargeContentViewer?: boolean;
  accessibilityLargeContentTitle?: string;
  accessibilityRespondsToUserInteraction?: boolean;

  accessibilityRole?:
    | 'none'
    | 'alertdialog' // Win32
    | 'application' // Win32
    | 'dialog' // Win32
    | 'group' // Win32
    | 'listitem' // Win32
    | 'presentation' // Win32
    | 'tabpanel' // Win32
    | 'textbox' // Win32
    | 'tree' // Win32
    | 'treeitem' // Win32
    | 'button'
    | 'togglebutton'
    | 'link'
    | 'search'
    | 'image'
    | 'keyboardkey'
    | 'text'
    | 'adjustable'
    | 'imagebutton'
    | 'header'
    | 'summary'
    | 'alert'
    | 'checkbox'
    | 'combobox'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'scrollbar'
    | 'spinbutton'
    | 'switch'
    | 'tab'
    | 'tabbar'
    | 'tablist'
    | 'timer'
    | 'list'
    | 'toolbar';
};

/**
 * Role-based text style names.
 */
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

export type IAdapterWin32TextProps = TextProps & {
  onKeyDown?: (args: IKeyboardEvent) => void;
  onKeyDownCapture?: (args: IKeyboardEvent) => void;
  onKeyUp?: (args: IKeyboardEvent) => void;
  onKeyUpCapture?: (args: IKeyboardEvent) => void;

  keyDownEvents?: IHandledKeyboardEvent[];
  keyUpEvents?: IHandledKeyboardEvent[];

  'aria-multiselectable'?: boolean | undefined;
  'aria-required'?: boolean | undefined;
  accessibilitySetSize?: number;
  accessibilityPositionInSet?: number;
  accessibilityDescription?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityAccessKey?: string;
  accessibilityLevel?: number;
  accessibilityItemType?: string;
  accessibilityControls?: string | undefined;
  accessibilityDescribedBy?: string | undefined;
  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-description'?: string | undefined;
  'aria-level'?: number | undefined;
  'aria-controls'?: string | undefined;
  'aria-describedby'?: string | undefined;

  onBlur?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onBlurCapture?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onFocus?: (ev: NativeSyntheticEvent<ObjectBase>) => void;
  onFocusCapture?: (ev: NativeSyntheticEvent<ObjectBase>) => void;

  focusable?: boolean;
  textStyle?: TextWin32TextStyle;
  tooltip?: string;

  // Added in newer React Native versions for iOS/macOS compatibility
  screenReaderFocusable?: boolean;
  accessibilityShowsLargeContentViewer?: boolean;
  accessibilityLargeContentTitle?: string;
  accessibilityRespondsToUserInteraction?: boolean;
};

export type IAdapterWin32ImageProps = ImageProps & {
  'aria-multiselectable'?: boolean | undefined;
  'aria-required'?: boolean | undefined;
  accessibilitySetSize?: number;
  accessibilityPositionInSet?: number;
  accessibilityDescription?: string;
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  accessibilityAccessKey?: string;
  accessibilityLevel?: number;
  accessibilityItemType?: string;
  accessibilityControls?: string | undefined;
  accessibilityDescribedBy?: string | undefined;
  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-description'?: string | undefined;
  'aria-level'?: number | undefined;
  'aria-controls'?: string | undefined;
  'aria-describedby'?: string | undefined;

  // Added in newer React Native versions for iOS/macOS compatibility
  screenReaderFocusable?: boolean;
  accessibilityShowsLargeContentViewer?: boolean;
  accessibilityLargeContentTitle?: string;
  accessibilityRespondsToUserInteraction?: boolean;
};

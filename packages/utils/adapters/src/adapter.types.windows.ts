import type { TextProps, ViewProps, ImageProps, NativeSyntheticEvent } from 'react-native';

export interface INativeKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  code?: string;
  eventPhase: 0 | 1 | 2 | 3;
}

export interface IHandledKeyboardEvent {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  code?: string;
  handledEventPhase?: 0 | 1 | 2 | 3;
}

export type IKeyboardEvent = NativeSyntheticEvent<INativeKeyboardEvent>;

export interface NativeMouseEvent {
  target: number;
  identifier: number;
  pageX: number;
  pageY: number;
  locationX: number;
  locationY: number;
  timestamp: number;
  pointerType: string;
  force: number;
  isLeftButton: boolean;
  isRightButton: boolean;
  isMiddleButton: boolean;
  isBarrelButtonPressed: boolean;
  isHorizontalScrollWheel: boolean;
  isEraser: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}

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

// [Windows]
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

// [Windows]
export type AccessibilityAnnotationInfo = Readonly<{
  typeID: AnnotationType;
  typeName?: string;
  author?: string;
  dateTime?: string;
  target?: string;
}>;

export type IAdapterWindowsViewProps = ViewProps & {
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
  focusable?: boolean;

  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-level'?: number | undefined;

  accessibilitySetSize?: number;
  accessibilityPosInSet?: number;
  accessibilityLevel?: number;

  accessibilityRole?:
    | 'none'
    | 'alertdialog' // Windows
    | 'application' // Windows
    | 'dialog' // Windows
    | 'group' // Windows
    | 'listitem' // Windows
    | 'presentation' // Windows
    | 'tabpanel' // Windows
    | 'textbox' // Windows
    | 'tree' // Windows
    | 'treeitem' // Windows
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
export type TextWindowsTextStyle =
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

export type IAdapterWindowsTextProps = TextProps & {
  accessibilitySetSize?: number;
  accessibilityPosInSet?: number;
  accessibilityLevel?: number;
  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-level'?: number | undefined;
};

export type IAdapterWindowsImageProps = ImageProps & {
  accessibilitySetSize?: number;
  accessibilityPosInSet?: number;
  accessibilityLevel?: number;
  'aria-posinset'?: number | undefined;
  'aria-setsize'?: number | undefined;
  'aria-level'?: number | undefined;
};

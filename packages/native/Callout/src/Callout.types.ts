import type * as React from 'react';
import type { AnimatableNumericValue, ColorValue, KeyboardMetrics, NativeSyntheticEvent, ViewProps } from 'react-native';

export const calloutName = 'Callout';

export type DirectionalHint =
  | 'leftTopEdge'
  | 'leftCenter'
  | 'leftBottomEdge'
  | 'topLeftEdge'
  | 'topAutoEdge'
  | 'topCenter'
  | 'topRightEdge'
  | 'rightTopEdge'
  | 'rightCenter'
  | 'rightBottomEdge'
  | 'bottomLeftEdge'
  | 'bottomAutoEdge'
  | 'bottomCenter'
  | 'bottomRightEdge';

export type DismissBehaviors = 'preventDismissOnKeyDown' | 'preventDismissOnClickOutside';

export interface RestoreFocusEvent {
  nativeEvent: {
    /** True when the Callout contained focus while it was dismissed. */
    containsFocus: boolean;
  };
}

export type CalloutOperationStatus =
  | 'confirmed'
  | 'cancelled'
  | 'not-mounted'
  | 'not-focusable'
  | 'inactive-window'
  | 'focus-moved'
  | 'unsupported'
  | 'failed';

export type CalloutReturnFocusStatus = Exclude<CalloutOperationStatus, 'unsupported'> | 'not-requested';
export type CalloutFocusIntent = 'keyboard' | 'pointer' | 'repair';
export type CalloutCloseReason = 'action' | 'programmatic' | 'submenu-back';
export type CalloutDismissReason = CalloutCloseReason | 'escape' | 'tab' | 'native-light-dismiss' | 'host-detached';
export type CalloutReadyEvent = NativeSyntheticEvent<{ generation: string }>;
export type CalloutMenuPointerMoveEvent = NativeSyntheticEvent<{
  generation: string;
  pointerId: string;
  screenX: number;
  screenY: number;
  /** Current-event nearest eligible hit descendant's native tag; 0 means no match in this popup. */
  targetTag: number;
}>;
export type CalloutDismissContextEvent = NativeSyntheticEvent<{
  generation: string;
  reason: CalloutDismissReason;
  returnFocus: CalloutReturnFocusStatus;
}>;

export interface CalloutFocusOutcome {
  status: CalloutOperationStatus;
}

export interface CalloutCloseOutcome extends CalloutFocusOutcome {
  returnFocus: CalloutReturnFocusStatus;
}

/**
 * Optional native appearance and positioning values. Callout applies only values
 * supplied by the caller and does not resolve theme defaults.
 */
export interface CalloutTokens {
  /** Anchor rectangle in DIPs relative to the React surface origin. */
  anchorRect?: KeyboardMetrics;
  /** Native Callout background color. */
  backgroundColor?: ColorValue;
  /** Width of the beak that points toward the anchor. */
  beakWidth?: number;
  /** Native Callout border color. */
  borderColor?: ColorValue;
  /** Native Callout corner radius. */
  borderRadius?: AnimatableNumericValue | string;
  /** Native Callout border width. */
  borderWidth?: number;
  /** Preferred placement relative to the anchor. */
  directionalHint?: DirectionalHint;
  /** Native dismissal behaviors that may be combined. */
  dismissBehaviors?: DismissBehaviors[];
  /** Gap between the anchor and Callout. */
  gapSpace?: number;
  /** Maximum Callout height. */
  maxHeight?: number | `${number}%`;
  /** Maximum Callout width. */
  maxWidth?: number | `${number}%`;
  /** Minimum padding from display edges. */
  minPadding?: number;
  /** Minimum Callout width. */
  minWidth?: number | `${number}%`;
}

export interface CalloutHandle {
  /** Makes the native Callout window resign key status. */
  blurWindow: () => void;
  /** Makes the native Callout window key. */
  focusWindow: () => void;
  /** Guarded, presentation-scoped child focus. Win32 retains its native legacy ownership. */
  focusInitialChild?: (generation: string, target: React.RefObject<React.Component | null>) => Promise<CalloutFocusOutcome>;
  /** Focuses a live child only while this popup owns native focus. macOS only. */
  focusOwnedChild?: (
    generation: string,
    target: React.RefObject<React.Component | null>,
    intent: CalloutFocusIntent,
  ) => Promise<CalloutFocusOutcome>;
  /** Guarded close/return. On macOS action closes the family; submenu-back closes only a child subtree. */
  closeOwned?: (generation: string, reason: CalloutCloseReason, returnFocus: boolean) => Promise<CalloutCloseOutcome>;
}

export interface CalloutProps extends ViewProps, CalloutTokens {
  /**
   * A string announced when the Callout is shown.
   * @platform win32
   */
  accessibilityOnShowAnnouncement?: string;
  /** Ref used to invoke native Callout window commands. */
  componentRef?: React.Ref<CalloutHandle>;
  /**
   * Prevents the native Callout from taking pointer capture when shown.
   * @platform win32
   */
  doNotTakePointerCapture?: boolean;
  /** Displays a beak that points toward the anchor. */
  isBeakVisible?: boolean;
  /**
   * Opts into presentation-scoped focus and native bare-Escape ownership.
   * Requires a live ref anchor and non-collapsible content. Not sent to Win32.
   * @platform macos, windows
   */
  menuFocusManagement?: boolean;
  /** Actual native content/window attachment, not focus confirmation. */
  onReady?: (event: CalloutReadyEvent) => void;
  /** Native close context; legacy onDismiss remains independently forwarded. */
  onDismissContext?: (event: CalloutDismissContextEvent) => void;
  /** Genuine displaced pointer movement in this managed macOS popup, in native screen coordinates. */
  onMenuPointerMove?: (event: CalloutMenuPointerMoveEvent) => void;
  /** Invoked after native dismissal. */
  onDismiss?: () => void;
  /**
   * Invoked during dismissal when the caller owns focus restoration.
   * @platform win32
   */
  onRestoreFocus?: (event: RestoreFocusEvent) => void;
  /** Invoked after the Callout is shown. */
  onShow?: () => void;
  /** Requests initial focus when the Callout is shown. */
  setInitialFocus?: boolean;
  /** Ref or registered native anchor identifier used for relative positioning. */
  target?: React.RefObject<React.Component | null> | string;
}

/** @deprecated Use CalloutProps. */
export type ICalloutProps = CalloutProps;
/** @deprecated Use CalloutTokens. */
export type ICalloutTokens = CalloutTokens;
/** @deprecated Use CalloutHandle. */
export type CalloutNativeCommands = CalloutHandle;

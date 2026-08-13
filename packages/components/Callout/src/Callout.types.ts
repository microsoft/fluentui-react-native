import type * as React from 'react';
import type { AnimatableNumericValue, ColorValue, KeyboardMetrics, ViewProps } from 'react-native';

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
  | 'bottonLeftEdge'
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

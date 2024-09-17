import type * as React from 'react';
import type { KeyboardMetrics, NativeMethods, ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { IRenderData } from '@uifabricshared/foundation-composable';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
export const calloutName = 'Callout';

/**
 * Properties and Tokens for FluentUI React Native Callout
 */

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
  | 'bottonLeftEdge'
  | 'bottomAutoEdge'
  | 'bottomCenter'
  | 'bottomRightEdge';

export type DismissBehaviors = 'preventDismissOnKeyDown' | 'preventDismissOnClickOutside';

export interface RestoreFocusEvent {
  nativeEvent: {
    /**
     * containsFocus is true if the Callout had focus while being dismissed.
     */
    containsFocus: boolean;
  };
}

/**
 * Omit the View-based focus functions from the Callout
 */
export interface OmittedViewFocusable {
  focus(): void;
  blur(): void;
}

export interface CalloutNativeCommands extends Omit<NativeMethods, keyof OmittedViewFocusable> {
  focusWindow: () => void;
  blurWindow: () => void;
}

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

interface OmittedBorderTokens {
  borderStyle?: ViewStyle['borderStyle'];
}

type CalloutBorderTokens = Omit<IBorderTokens, keyof OmittedBorderTokens>;

export interface ICalloutTokens extends IBackgroundColorTokens, CalloutBorderTokens {
  /**
   * AnchorRect arbitrary anchor rectangle; coordinate system is in DIPs, relative
   * to the React surface origin.
   */
  anchorRect?: KeyboardMetrics;

  /**
   * Width of the beak on the Callout indicating its anchor.
   */
  beakWidth?: number;

  /**
   * Defines the suggested drop direction and alignment for the Callout to use, relative
   * to the anchor information.
   */
  directionalHint?: DirectionalHint;

  /**
   * Defines variations on how the callout dismissal may be controlled.  the async eventing
   * of React-Native makes passing some aspects of dismissal control over to JS difficult.
   * Moreover, the native platform or host may have competing priorities with regards to transient UI
   * that generate bi-directional lifetime management between JS (which mounts and unmounts the
   * component) and native (which may tear down the transient UI without JS input).
   *
   * This property provides control over the latter issue, enabling relevant native platform
   * interactions with transient UI to be managed from JS.
   *
   * These behaviors should generally be orthogonal, and therefore combinable.
   */
  dismissBehaviors?: DismissBehaviors[];

  /**
   * Defines the size of the gap between the anchor and the Callout.  Not used if
   * no anchor information is provided.
   */
  gapSpace?: number;

  /**
   * Defines a maximum height for the Callout.
   */
  maxHeight?: number | `${number}%`;

  /**
   * Defines a maximum width for the Callout.
   */
  maxWidth?: number | `${number}%`;

  /**
   * Defines a minimum width for the Callout.
   */
  minWidth?: number | `${number}%`;

  /**
   * Defines the minimum padding between the Callout and the display edges.
   */
  minPadding?: number;
}

export interface ICalloutProps extends IViewProps, ICalloutTokens {
  /**
   * A string that should be announced when the callout is shown.
   * @platform win32
   */
  accessibilityOnShowAnnouncement?: string;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<CalloutNativeCommands>;

  /**
   * Defines event redirection behaviors for pointer events relative to the Callout control.
   *
   * Pointer events (i.e. mouse, pen, touch) often have the effect of initiating and dismissing Callout controls.
   * Typically the instigating events are click events, but when using a mouse may also include pointer enter
   * and leave events i.e. hover.  Once opened, many Callout scenarios desire modal-like interactions, where
   * the user must interact with or relative to the Callout before interacting with other controls again. A common
   * example is context menus, where pointer events away from the menu may dismiss the context menu.  Such an interaction
   * can initiate unintended actions such as invoking a button or otherwise pointer-responsive surface.  The modal-like
   * behavior is the most common case of Callout usage, and having "safe" areas to press-dismiss the Callout without
   * invoking additional actions is useful.
   *
   * This modal-like behavior, where true modal behavior would specifically require interacting with the modal component until
   * it is dismissed, has implications for canonical event routing in React-Native.  Canonically all pointer events are passed in
   * a Capture phase from the root element to the target element, then bubbled back from the target element to the root element.
   * This structure allows many interaction patterns to be implemented that may include stopping event routing in each phase.
   * This event routing can disrupt the modal-like behavior desired by a Callout control, which in native frameworks may take
   * advantage of a "take event capture" feature -- making the Callout the first handler of the pointer event.  The event may optionally
   * be forwarded afterwards to the canonical event routing pattern for further handling (and often is not forwarded).
   *
   * One impact of "taking event capture" is the implicit behavior for mouse events on the parent surface of the Callout -- if
   * event capture is taken by the Callout, paired events may fire such as a mouse leave event.  This makes sense if we think about
   * the event behavior after the Callout has taken capture; mouse enter and mouse leave events would only propagate to the parent surface
   * if the Callout event handling decided to forward said events (often not).  As paired events, however, there should not be a
   * mouse enter event without a corresponding mouse leave event (or vice versa).  Since mouse enter and mouse leave events would not
   * naturally fire on the parent surface when the Callout has pointer capture, the parent surface should receive a mouse leave event when
   * the Callout takes capture.
   *
   * Coming back to the start of this comment, some Callout scenarios may be initiated by mouse enter/leave events.  A common example is
   * tooltips, which are supported on lower-level React-Native components, but such behavior is not exclusive to tooltips.
   * The Callout control is generally used for more advanced scenarios, as mentioned before often desiring modal-like behavior and accordingly
   * the default behavior of the Callout control is to take pointer capture.  Accounting for the paired mouse enter/leave events in the paragraph
   * above, it is difficult to have a mouse enter/leave-invoked Callout that takes pointer capture -- without significant workarounds,
   * the Callout would open and close cyclically from repeated mouse enter/leave events.  There are other scenarios where taking pointer capture
   * is not desirable, such as a semi-persistent Callout; to support these scenarios the doNotTakePointerCapture property is offered to
   * specify if the Callout should not take pointer capture when it opens.
   *
   * While pointer capture is generally managed in native frameworks via imperative APIs, managing pointer capture is offered as a property that
   * only affects the Callout's on-show behavior when it would typically take pointer capture.  This design implies that changing this property after
   * the Callout has been shown has no effect -- similar to the Callout's onShow callback.  Doing so simplifies Callout usage for developers,
   * not needing to mind native platform pointer capture that may be complex particularly when React-Native is integrated into a larger app.
   * Pointer capture may be lost (and regained) but is otherwise abstracted away from the developer.  More advanced control of pointer capture
   * would need to be provided by a native module independent of any particular control.
   *
   * When the Callout is closed, pointer capture is released by the Callout and further handled by the native platform -- generally returning
   * pointer capture to the parent surface.
   * @platform win32
   */
  doNotTakePointerCapture?: boolean;

  /**
   * Adds a beak to the Callout, pointing to the anchor target.
   * Notable Win32 limitation: Beak rendering currently limits the border width to its default, and the
   * border width prop will not be honored.
   * @platform win32
   */
  isBeakVisible?: boolean;

  /**
   * Callback invoked when the callout has been dismissed.
   */
  onDismiss?: () => void;

  /**
   * Callback invoked during callout dismissal; if set, focus will not be restored by the callout and onRestoreFocus must
   * result in focus being moved to the appropriate focusable target.
   *
   * The callee should carefully consider their scenarios to avoid dropping focus, or inappropriately
   * moving focus from another component.  Focus is not guaranteed to have entered the React-Native surface at all, and
   * this callback is most appropriate for components strictly controlling focus.
   *
   * restoreFocusEvent.nativeEvent.containsFocus is true if the Callout had focus while being dismissed.
   * @platform win32
   */
  onRestoreFocus?: (restoreFocusEvent: RestoreFocusEvent) => void;

  /**
   * Callback invoked when the callout has been shown.
   */
  onShow?: () => void;

  /**
   * Determines whether the Callout sets focus when displayed.
   * On macOS: this determines whether the Callout becomes the key window.
   * On win32: If true then the callout will attempt to focus the first focusable element that it contains.
   * If it doesn't find an element, no focus will be set. This means that it's the contents responsibility
   * to either set focus or have focusable items.
   */
  setInitialFocus?: boolean;

  /**
   * Target node the callout uses for relative positioning; the anchor of the callout.
   * A ref is the typical usage; certain components may proffer a string as an anchor target, such as
   * anchoring to a point inside the component.
   */
  target?: React.RefObject<React.Component> | string;
}

export type ICalloutSlotProps = {
  root: ICalloutProps;
};

export type ICalloutRenderData = IRenderData<ICalloutSlotProps>;

export interface ICalloutType {
  props: ICalloutProps;
  slotProps: ICalloutSlotProps;
  tokens: ICalloutTokens;
}

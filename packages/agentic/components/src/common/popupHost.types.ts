import type * as React from 'react';
import type { Callout, CalloutProps, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

/** The native-core popup capabilities of a host with a modern popup route, and how that host behaves. */
export interface PopupHost {
  /** The Callout with the host's default entry focus. */
  Callout: typeof Callout;
  /**
   * The Callout for popups that request every entry focus themselves with an explicit target. Win32, whose Callout
   * otherwise focuses the first content as it shows, opts out of that initial focus; other hosts use their Callout.
   */
  ExplicitFocusCallout: React.FunctionComponent<CalloutProps>;
  FocusZone: typeof FocusZone;
  useNativeViewTarget: typeof useNativeViewTarget;
  /**
   * Whether closing a focused nested popup natively returns keyboard focus to the view its owner popup retained, so
   * the owner sends no restore request that could land after newer keyboard navigation.
   */
  restoresOwnerFocus: boolean;
  /**
   * Whether a view's hover-out means the pointer left it. Win32 reports a leave with the enter of the same move, so a
   * pending hover change there waits for the pointer to enter another view.
   */
  reportsPointerLeave: boolean;
}

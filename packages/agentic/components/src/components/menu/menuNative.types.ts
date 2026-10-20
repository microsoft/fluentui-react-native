import type * as React from 'react';
import type { CalloutProps, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

/** The native-core capabilities Menu needs from a host with a popup route. */
export interface MenuNativeHost {
  Callout: React.FunctionComponent<CalloutProps>;
  FocusZone: typeof FocusZone;
  useNativeViewTarget: typeof useNativeViewTarget;
  /**
   * Whether closing a focused nested popup natively returns keyboard focus to the row its owner popup retained. Menu
   * then sends no restore request for that row, which could land after newer keyboard navigation in the owner popup.
   */
  restoresOwnerFocus: boolean;
  /**
   * Whether a row's hover-out means the pointer left the row. Win32 hosts report a leave with the enter of the same
   * move, so Menu there keeps a pending submenu change until the pointer enters another row.
   */
  reportsPointerLeave: boolean;
}

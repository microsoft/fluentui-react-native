import type * as React from 'react';
import type { CalloutProps, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

/** The native-core capabilities Dropdown needs from a host with a popup route. */
export interface DropdownNativeHost {
  Callout: React.FunctionComponent<CalloutProps>;
  FocusZone: typeof FocusZone;
  useNativeViewTarget: typeof useNativeViewTarget;
}

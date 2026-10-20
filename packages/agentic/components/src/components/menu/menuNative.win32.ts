import * as React from 'react';

import { Callout as Win32Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/win32';
import type { CalloutProps } from '@fluentui-react-native/native-core/win32';

import type { MenuNativeHost } from './menuNative.types';

// Menu requests every entry focus itself, so a submenu that hover opens leaves focus in its owner popup.
function Callout(props: CalloutProps) {
  return React.createElement(Win32Callout, { ...props, initialFocus: 'none' });
}

export const menuNativeHost: MenuNativeHost | undefined = {
  Callout,
  FocusZone,
  useNativeViewTarget,
  restoresOwnerFocus: false,
  reportsPointerLeave: false,
};

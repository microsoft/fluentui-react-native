import * as React from 'react';

import { Callout as Win32Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/win32';
import type { CalloutProps } from '@fluentui-react-native/native-core/win32';

import type { DropdownNativeHost } from './dropdownNative.types';

// Dropdown focuses its entry option itself, so the host takes no initial focus.
function Callout(props: CalloutProps) {
  return React.createElement(Win32Callout, { ...props, initialFocus: 'none' });
}

export const dropdownNativeHost: DropdownNativeHost | undefined = { Callout, FocusZone, useNativeViewTarget };

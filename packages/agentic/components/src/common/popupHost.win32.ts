import * as React from 'react';

import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/win32';
import type { CalloutProps } from '@fluentui-react-native/native-core/win32';

import type { PopupHost } from './popupHost.types';

function ExplicitFocusCallout(props: CalloutProps) {
  return React.createElement(Callout, { ...props, initialFocus: 'none' });
}

export const popupHost: PopupHost | undefined = {
  Callout,
  ExplicitFocusCallout,
  FocusZone,
  useNativeViewTarget,
  restoresOwnerFocus: false,
  reportsPointerLeave: false,
};

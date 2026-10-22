import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/windows';

import type { PopupHost } from './popupHost.types';

export const popupHost: PopupHost | undefined = {
  Callout,
  ExplicitFocusCallout: Callout,
  FocusZone,
  useNativeViewTarget,
  restoresOwnerFocus: true,
  reportsPointerLeave: true,
};

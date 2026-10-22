import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

import type { PopupHost } from './popupHost.types';

export const popupHost: PopupHost | undefined = {
  Callout,
  ExplicitFocusCallout: Callout,
  FocusZone,
  useNativeViewTarget,
  restoresOwnerFocus: false,
  reportsPointerLeave: true,
};

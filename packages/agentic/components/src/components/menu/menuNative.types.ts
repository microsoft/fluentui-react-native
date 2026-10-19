import type { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

/** The native-core capabilities Menu needs from a host with a modern popup route. */
export interface MenuNativeHost {
  Callout: typeof Callout;
  FocusZone: typeof FocusZone;
  useNativeViewTarget: typeof useNativeViewTarget;
}

import type { Callout, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';

/** The native-core capabilities Popover needs from a host with a modern popup route. */
export interface PopoverNativeHost {
  Callout: typeof Callout;
  useNativeViewTarget: typeof useNativeViewTarget;
}

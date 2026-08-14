import type { Image, StyleProp, Text, View, ViewProps, ViewStyle } from 'react-native';
import type { ComponentProps, ComponentState, OptionalSlot, OwnedRootProps, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';

export type AvatarSize = 16 | 20 | 24 | 28 | 32 | 40 | 56 | 120;
export type AvatarContentMode = 'image' | 'icon' | 'initials';

export type AvatarSlots = {
  root: Slot<typeof View>;
  image: OptionalSlot<typeof Image>;
  icon: OptionalSlot<typeof Icon>;
  initials: OptionalSlot<typeof Text>;
};

export type AvatarStateProps = {
  /**
   * Whether the avatar should render an outer active/collaboration ring.
   */
  activityRing?: boolean;

  /**
   * The avatar diameter in pixels.
   */
  size?: AvatarSize;
};

export type AvatarRootProps = OwnedRootProps<ViewProps>;

export type AvatarProps = AvatarStateProps & ComponentProps<AvatarSlots, AvatarRootProps>;

export type AvatarState = ComponentState<AvatarSlots> &
  Required<AvatarStateProps> &
  ThemeState & {
    contentMode: AvatarContentMode;
    userStyle?: StyleProp<ViewStyle>;
  };

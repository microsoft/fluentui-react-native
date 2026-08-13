import type { Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native';
import type { ComponentProps, ComponentState, OptionalSlot, PressableState, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';

export type TagSlots = {
  root: Slot<typeof Pressable>;
  content: OptionalSlot<typeof Text>;
  leadingIcon: OptionalSlot<typeof Icon>;
  dismissIcon: OptionalSlot<typeof Icon>;
};

export type TagAppearance = 'primary' | 'secondary';
export type TagLayout = 'iconAndText' | 'iconOnly';
export type TagSize = 'small' | 'medium';
export type TagShape = 'rounded' | 'circular';

export type TagStateProps = {
  disabled?: boolean;
  appearance?: TagAppearance;
  layout?: TagLayout;
  size?: TagSize;
  shape?: TagShape;
  dismiss?: boolean;
};

export type TagRootProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type TagProps = TagStateProps & ComponentProps<TagSlots, TagRootProps>;

export type TagState = ComponentState<TagSlots> &
  Required<TagStateProps> &
  ThemeState &
  PressableState & {
    hasContent: boolean;
    hasLeadingIcon: boolean;
    iconOnly: boolean;
    showDismissIcon: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };

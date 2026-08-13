import type { PressableProps, Text, View, ViewProps, ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';

import type { ComponentProps, ComponentState, OptionalSlot, PressableState, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';

export type ListboxItemSecondaryContentPosition = 'right' | 'under';
export type ListboxItemVariant = 'listItem' | 'sectionHeader';

export type ListboxItemSlots = {
  content: Slot<typeof Text>;
  secondaryContent: OptionalSlot<typeof Text>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
};

type ListboxItemStateSlots = ListboxItemSlots & {
  contentHidden: OptionalSlot<typeof Text>;
};

export type ListboxItemStateProps = {
  variant?: ListboxItemVariant;
  selected?: boolean;
  disabled?: boolean;
  secondaryContentPosition?: ListboxItemSecondaryContentPosition;
  checkmark?: boolean;
  chevron?: boolean;
  multiselect?: boolean;
  loading?: boolean;
};

export type ListboxItemRootProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type ListboxItemProps = ListboxItemStateProps & ComponentProps<ListboxItemSlots, ListboxItemRootProps>;

export type ListboxItemState = ComponentState<ListboxItemStateSlots> &
  Required<ListboxItemStateProps> &
  ThemeState &
  PressableState & {
    headerProps: ViewProps;
    rootProps: PressableProps;
    userStyle?: StyleProp<ViewStyle>;
  };

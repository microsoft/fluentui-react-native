import type { Pressable, PressableProps, Text, View, ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import type { ItemSecondaryContentPosition } from '../../common/item.types';
import type { SelectionDriverKeys, SelectionStateProps } from '../../common/selection.types';

export type ListboxItemSecondaryContentPosition = ItemSecondaryContentPosition;
export type ListboxItemVariant = 'listItem' | 'sectionHeader';

export type ListboxItemSlots = {
  root: Slot<typeof Pressable>;
  content: Slot<typeof Text>;
  secondaryContent: OptionalSlot<typeof Text>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
};

type ListboxItemStateSlots = ListboxItemSlots & {
  checkboxIndicator: OptionalSlot<typeof CheckboxIndicator>;
  checkmarkIndicator: OptionalSlot<typeof Icon>;
  chevronIndicator: OptionalSlot<typeof Icon>;
  contentHidden: OptionalSlot<typeof Text>;
  header: Slot<typeof View>;
};

export type ListboxItemStateProps = {
  variant?: ListboxItemVariant;
  disabled?: boolean;
  secondaryContentPosition?: ListboxItemSecondaryContentPosition;
  checkmark?: boolean;
  chevron?: boolean;
  multiselect?: boolean;
  loading?: boolean;
} & SelectionStateProps;

export type ListboxItemRootProps = OwnedRootProps<PressableProps>;

export type ListboxItemProps = ListboxItemStateProps & ComponentProps<ListboxItemSlots, ListboxItemRootProps>;

export type ListboxItemState = ComponentState<ListboxItemStateSlots> &
  Required<Omit<ListboxItemStateProps, SelectionDriverKeys>> &
  ThemeState &
  PressableState & {
    userStyle?: StyleProp<ViewStyle>;
  };

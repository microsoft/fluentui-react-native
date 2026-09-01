import type { Pressable, Text, View, ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { ItemSecondaryContentPosition } from '../../common/item.types';

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
  /**
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
};

export type ListboxItemRootProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

export type ListboxItemProps = ListboxItemStateProps & ComponentProps<ListboxItemSlots, ListboxItemRootProps>;

export type ListboxItemState = ComponentState<ListboxItemStateSlots> &
  Required<ListboxItemStateProps> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    userStyle?: StyleProp<ViewStyle>;
  };

import type { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { Avatar } from '../avatar/avatar';
import type { AvatarSize } from '../avatar/avatar.types';
import type { Text } from '../text/text';

export type NavItemDensity = 'comfortable' | 'compact';
export type NavItemNesting = 'topLevel' | 'subItem';
export type NavItemType = 'item' | 'category';

export type NavItemSlots = {
  root: Slot<typeof Pressable>;
  /**
   * The destination name. Removed from layout when `showLabel` is false.
   */
  label: OptionalSlot<typeof Text>;
  /**
   * The leading glyph shown while the row is not selected.
   */
  icon: OptionalSlot<typeof Icon>;
  /**
   * The leading glyph shown while the row is selected. Falls back to `icon`.
   */
  selectedIcon: OptionalSlot<typeof Icon>;
  /**
   * The leading identity visual. Takes precedence over both icons.
   */
  avatar: OptionalSlot<typeof Avatar>;
  /**
   * A short trailing count or status string.
   */
  trailingContent: OptionalSlot<typeof Text>;
  /**
   * A container for at most two trailing icon-only controls.
   */
  trailingActions: OptionalSlot<typeof View>;
};

export type NavItemStateSlots = NavItemSlots & {
  chevron: OptionalSlot<typeof Icon>;
  chevronContainer: OptionalSlot<typeof View>;
  labelHidden: OptionalSlot<typeof Text>;
  selectedIndicator: Slot<typeof View>;
};

export type NavItemStateProps = {
  /**
   * The identifier of the sub-item group a category row discloses. Ignored on an item row.
   */
  controls?: string;
  /**
   * The row rhythm. A parent navigation forwards one density to every row.
   */
  density?: NavItemDensity;
  disabled?: boolean;
  /**
   * Whether the category row's sub-item group is open. Disclosure is externally driven: NavItem does not render the
   * group, so it renders the value it is given and reports presses through `onPress`.
   */
  expanded?: boolean;
  /**
   * Whether the row is indented as a child of a category.
   */
  nesting?: NavItemNesting;
  /**
   * Whether the component renders as the current destination. Selection is externally driven: the caller or the
   * surrounding navigation owns the value, and the component reports interactions through `onPress`.
   */
  selected?: boolean;
  /**
   * Whether the label and trailing regions participate in layout. False renders the collapsed icon rail row.
   */
  showLabel?: boolean;
  /**
   * Whether the row navigates to a destination or discloses a group.
   */
  type?: NavItemType;
};

export type NavItemExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

type NavItemLabeledProps = {
  showLabel?: true;
};

type NavItemRailProps = {
  showLabel: false;
  accessibilityLabel: string;
  label?: never;
};

export type NavItemProps = NavItemStateProps &
  ComponentProps<NavItemSlots, NavItemExposedPressableProps> &
  (NavItemLabeledProps | NavItemRailProps);

export type NavItemMetrics = {
  avatarSize: AvatarSize;
  chevronSize: number;
  indicatorInsetStart: number;
  indicatorInsetVertical: number;
  indicatorWidth: number;
  leadingGap: number;
  leadingSize: number;
  rootPaddingHorizontal: number;
  rootPaddingStart: number;
  rootPaddingVertical: number;
  trailingGap: number;
  trailingItemGap: number;
};

export type NavItemState = ComponentState<NavItemStateSlots> &
  Required<Omit<NavItemStateProps, 'controls'>> &
  Pick<NavItemStateProps, 'controls'> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    metrics: NavItemMetrics;
    userStyle?: StyleProp<ViewStyle>;
  };

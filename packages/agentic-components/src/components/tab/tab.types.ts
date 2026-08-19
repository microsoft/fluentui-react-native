import type { Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  Slot,
  SlotProp,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { SelectionDriverKeys, SelectionStateProps } from '../../common/selection.types';

export type TabLayout = 'iconAndText' | 'iconOnly';

export type TabSlots = {
  root: Slot<typeof Pressable>;
  content: OptionalSlot<typeof Text>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
};

type TabStateSlots = TabSlots & {
  contentHidden: OptionalSlot<typeof Text>;
};

export type TabStateProps = {
  /**
   * Whether the tab is disabled.
   */
  disabled?: boolean;
  /**
   * The visual layout of the tab.
   */
  layout?: TabLayout;
  /**
   * The id of the tabpanel controlled by this tab.
   */
  controls: string;
} & SelectionStateProps;

export type TabExposedPressableProps = OwnedRootProps<PressableProps>;

type TabIconOnlyProps = {
  layout: 'iconOnly';
  accessibilityLabel: string;
  content?: never;
  icon: SlotProp<typeof Icon>;
};

type TabIconAndTextProps = {
  layout?: 'iconAndText';
};

export type TabProps = TabStateProps & ComponentProps<TabSlots, TabExposedPressableProps> & (TabIconAndTextProps | TabIconOnlyProps);

export type TabState = ComponentState<TabStateSlots> &
  Required<Omit<TabStateProps, SelectionDriverKeys>> &
  ThemeState &
  PressableState & {
    iconOnly: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };

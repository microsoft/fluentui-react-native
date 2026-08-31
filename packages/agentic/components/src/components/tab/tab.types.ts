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

import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { Icon } from '../../primitives/icon/icon';
import type { TabKeyEvent } from '../tablist/tablist.types';

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
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
  /**
   * Stable group selection value. TabList falls back to `controls` when this
   * is omitted.
   */
  value?: string;
  /**
   * The id of the tabpanel controlled by this tab.
   */
  controls: string;
};

export type TabExposedPressableProps = OwnedRootProps<
  PressableProps & {
    accessibilityPosInSet?: number;
    accessibilitySetSize?: number;
    onKeyDown?: (event: TabKeyEvent) => void;
  }
>;

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
  Required<TabStateProps> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    iconOnly: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };

import type { Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';

import type { ComponentProps, ComponentState, OptionalSlot, OwnedRootProps, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { SelectionDriverKeys, SelectionStateProps } from '../../common/selection.types';

export type CardSize = 'small' | 'large';
export type CardPadding = 'default' | 'none';
export type CardLayout = 'default' | 'nested' | 'structured';
export type CardDirection = 'vertical' | 'horizontal';

export type CardSlots = {
  root: Slot<typeof View>;
  content: Slot<typeof View>;
  header: OptionalSlot<typeof View>;
  content02: OptionalSlot<typeof View>;
  footer: OptionalSlot<typeof View>;
};

type CardStateSlots = CardSlots & {
  overlay: OptionalSlot<typeof Pressable>;
};

export type CardStateProps = {
  disabled?: boolean;
  size?: CardSize;
  padding?: CardPadding;
  layout?: CardLayout;
  direction?: CardDirection;
} & SelectionStateProps;

export type CardExposedPressableProps = OwnedRootProps<PressableProps, 'accessibilityRole'> & {
  children?: never;
};

export type CardProps = CardStateProps & ComponentProps<CardSlots, CardExposedPressableProps>;

export type CardState = ComponentState<CardStateSlots> &
  Required<Omit<CardStateProps, SelectionDriverKeys>> &
  ThemeState & {
    hovered: boolean;
    pressed: boolean;
    focused: boolean;
    isInteractive: boolean;
    isSelectable: boolean;
    resolvedDirection: CardDirection;
    userStyle?: StyleProp<ViewStyle>;
  };

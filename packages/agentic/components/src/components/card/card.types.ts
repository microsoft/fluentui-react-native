import type { Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

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
  /**
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
};

export type CardExposedPressableProps = OwnedRootProps<PressableProps, 'accessibilityRole'> & {
  children?: never;
} & Pick<PropsWithRefOf<typeof View>, 'ref'>;

export type CardProps = CardStateProps & ComponentProps<CardSlots, CardExposedPressableProps>;

export type CardState = ComponentState<CardStateSlots> &
  Required<CardStateProps> &
  ThemeState & {
    focusVisualProps?: FocusVisualProps;
    hovered: boolean;
    pressed: boolean;
    focused: boolean;
    isInteractive: boolean;
    isSelectable: boolean;
    resolvedDirection: CardDirection;
    userStyle?: StyleProp<ViewStyle>;
  };

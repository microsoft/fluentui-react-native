import type { StyleProp, ViewStyle, ViewProps, Text, View } from 'react-native';

import type { ComponentProps, ComponentState, OptionalSlot, OwnedRootProps, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';

export type DividerLayout = 'center' | 'start' | 'end';

export type DividerSlots = {
  root: Slot<typeof View>;
  icon: OptionalSlot<typeof Icon>;
  label: OptionalSlot<typeof Text>;
};

type DividerStateSlots = DividerSlots & {
  contentContainer: OptionalSlot<typeof View>;
};

export type DividerStateProps = {
  layout?: DividerLayout;
  vertical?: boolean;
};

export type DividerExposedViewProps = OwnedRootProps<ViewProps, 'accessibilityRole' | 'focusable'>;

export type DividerProps = DividerStateProps & ComponentProps<DividerSlots, DividerExposedViewProps>;

export type DividerState = ComponentState<DividerStateSlots> &
  Required<DividerStateProps> &
  ThemeState & {
    contentVisible: boolean;
    hasIcon: boolean;
    hasLabel: boolean;
    labelText?: string;
    userStyle?: StyleProp<ViewStyle>;
  };

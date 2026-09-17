import type { Pressable, StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

export type RadioSlots = {
  /**
   * The interactive root of the radio.
   */
  root: Slot<typeof Pressable>;
};

export type RadioStateProps = {
  /**
   * Whether the radio is disabled.
   */
  disabled?: boolean;
  /**
   * The visible label for the radio.
   */
  label?: string;
  /**
   * Optional supporting text displayed beneath the label.
   */
  secondaryText?: string;
  /**
   * Whether the supporting text is shown.
   */
  showSecondaryText?: boolean;
  /**
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
};

export type RadioExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>, 'accessibilityRole' | 'role'> & {
  children?: never;
};

export type RadioProps = RadioStateProps & ComponentProps<RadioSlots, RadioExposedPressableProps>;

export type RadioState = ComponentState<RadioSlots> &
  Required<RadioStateProps> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    /**
     * User styling applied after the component styles.
     */
    userStyle?: StyleProp<ViewStyle>;
    rootStyle: StyleProp<ViewStyle>;
    indicatorStyle: StyleProp<ViewStyle>;
    indicatorDotStyle: StyleProp<ViewStyle>;
    labelContainerStyle: StyleProp<ViewStyle>;
    labelStyle: StyleProp<TextStyle>;
    secondaryTextStyle: StyleProp<TextStyle>;
  };

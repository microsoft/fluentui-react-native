import type { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentProps, ComponentState, PressableState, Slot } from '@fluentui-react-native/framework-base';

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
   * Whether the radio is selected.
   */
  selected?: boolean;
};

export type RadioExposedPressableProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type RadioProps = RadioStateProps & ComponentProps<RadioSlots, RadioExposedPressableProps>;

export type RadioState = ComponentState<RadioSlots> &
  Required<RadioStateProps> &
  ThemeState &
  PressableState & {
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

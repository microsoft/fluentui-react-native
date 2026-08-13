import { attachSlotProps } from '@fluentui-react-native/framework-base';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import {
  radioStyles,
  getRadioFocus,
  getRadioIndicatorBorder,
  getRadioIndicatorDotColorStyle,
  getRadioIndicatorDotLayout,
  getRadioIndicatorLayout,
  getRadioLabelColorStyle,
  getRadioLabelContainerLayout,
  getRadioLabelTypography,
  getRadioRootLayout,
  getRadioSecondaryTextColorStyle,
  getRadioSecondaryTypography,
} from './radio.styles';
import type { RadioState } from './radio.types';

/**
 * Applies styles and slot props to the Radio component state.
 */
export function useRadioStyles_unstable(state: RadioState) {
  const rootStyle: StyleProp<ViewStyle> = [radioStyles.root, getRadioRootLayout(state), getRadioFocus(state), state.userStyle];
  const indicatorStyle: StyleProp<ViewStyle> = [radioStyles.indicator, getRadioIndicatorLayout(state), getRadioIndicatorBorder(state)];
  const indicatorDotStyle: StyleProp<ViewStyle> = [
    radioStyles.dot,
    getRadioIndicatorDotLayout(state),
    getRadioIndicatorDotColorStyle(state),
    { opacity: state.selected ? 1 : 0 },
  ];
  const labelContainerStyle: StyleProp<ViewStyle> = [radioStyles.labelContainer, getRadioLabelContainerLayout(state)];
  const labelStyle: StyleProp<TextStyle> = [radioStyles.label, getRadioLabelTypography(state), getRadioLabelColorStyle(state)];
  const secondaryTextStyle: StyleProp<TextStyle> = [
    radioStyles.secondaryText,
    getRadioSecondaryTypography(state),
    getRadioSecondaryTextColorStyle(state),
  ];

  state.rootStyle = rootStyle;
  state.indicatorStyle = indicatorStyle;
  state.indicatorDotStyle = indicatorDotStyle;
  state.labelContainerStyle = labelContainerStyle;
  state.labelStyle = labelStyle;
  state.secondaryTextStyle = secondaryTextStyle;

  attachSlotProps(state.root, {
    style: rootStyle,
  });
}

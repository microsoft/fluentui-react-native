import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  checkboxStyles,
  checkboxIndicatorIconSize,
  checkboxTextStyles,
  getCheckboxFocusStyle,
  getCheckboxIndicatorColors,
  getCheckboxIndicatorIconColors,
  getCheckboxIndicatorStyle,
  getCheckboxLabelColors,
  getCheckboxLabelContainerStyle,
  getCheckboxRootStyle,
  getCheckboxSecondaryTextColors,
} from './checkbox.styles';
import type { CheckboxState } from './checkbox.types';

export function useApplyStyles_unstable(state: CheckboxState) {
  const textThemeStyles = checkboxTextStyles(state);
  const indicatorColors = getCheckboxIndicatorColors(state);
  const labelColors = getCheckboxLabelColors(state);
  const secondaryTextColors = getCheckboxSecondaryTextColors(state);
  const indicatorIconColors = getCheckboxIndicatorIconColors(state);

  const rootStyle: StyleProp<ViewStyle> = [checkboxStyles.root, getCheckboxRootStyle(state), getCheckboxFocusStyle(state), state.userStyle];
  const indicatorStyle: StyleProp<ViewStyle> = [checkboxStyles.indicator, getCheckboxIndicatorStyle(state), indicatorColors];
  const labelContainerStyle: StyleProp<ViewStyle> = [checkboxStyles.labelContainer, getCheckboxLabelContainerStyle(state)];
  const labelStyle: StyleProp<TextStyle> = [checkboxStyles.labelText, textThemeStyles.label, labelColors];
  const secondaryTextStyle: StyleProp<TextStyle> = [checkboxStyles.secondaryText, textThemeStyles.secondaryText, secondaryTextColors];

  attachSlotProps(state.root, { style: rootStyle });
  state.indicatorStyle = indicatorStyle;
  state.labelContainerStyle = labelContainerStyle;
  state.indicatorIconColor = indicatorIconColors.color;
  state.indicatorIconSize = checkboxIndicatorIconSize;

  if (state.labelText) {
    attachSlotProps(state.labelText, {
      style: labelStyle,
    });
  }

  if (state.secondaryTextSlot) {
    attachSlotProps(state.secondaryTextSlot, {
      style: secondaryTextStyle,
    });
  }
}

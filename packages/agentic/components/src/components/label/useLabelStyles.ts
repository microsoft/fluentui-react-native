import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getLabelContentColorStyle,
  getLabelRequiredIndicatorColorStyle,
  getLabelSizeStyle,
  getLabelThemedStyles,
  getLabelWeightStyle,
  labelStyles,
} from './label.styles';
import type { LabelState } from './label.types';

/**
 * Applies Label styles and resolved slot props.
 */
export function useLabelStyles_unstable(state: LabelState): void {
  const themedStyles = getLabelThemedStyles(state);
  const typographyStyle: StyleProp<TextStyle> = [getLabelSizeStyle(state), getLabelWeightStyle(state)];
  const rootStyle: StyleProp<ViewStyle> = [themedStyles.root, state.userStyle];

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.content, {
    style: [labelStyles.content, typographyStyle, getLabelContentColorStyle(state)],
  });
  if (state.requiredIndicator) {
    attachSlotProps(state.requiredIndicator, {
      style: [typographyStyle, getLabelRequiredIndicatorColorStyle(state)],
    });
  }
}

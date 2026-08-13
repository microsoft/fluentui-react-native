import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { dividerStyles, getDividerContentStyle, getDividerLabelStyle, getDividerLineStyle, getDividerRootStyle } from './divider.styles';
import type { DividerState } from './divider.types';

/**
 * Applies token-derived and instance-derived styles to Divider slots.
 */
export function useApplyStyles_unstable(state: DividerState) {
  const rootStyle: StyleProp<ViewStyle> = [dividerStyles.root, getDividerRootStyle(state), state.userStyle];
  const contentStyle: StyleProp<ViewStyle> = [dividerStyles.content, getDividerContentStyle(state)];
  const labelStyle: StyleProp<TextStyle> = [dividerStyles.label, getDividerLabelStyle(state)];

  attachSlotProps(state.root, {
    style: rootStyle,
  });

  if (state.contentContainer) {
    attachSlotProps(state.contentContainer, {
      accessible: false,
      style: contentStyle,
    });
  }

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: state.tokens.color.foregroundNeutralSecondary,
      height: 20,
      width: 20,
    });
  }

  if (state.label) {
    attachSlotProps(state.label, {
      accessible: false,
      style: labelStyle,
    });
  }
}

export function getDividerBeforeLineStyle(state: DividerState): ViewStyle {
  return getDividerLineStyle(state, 'before');
}

export function getDividerAfterLineStyle(state: DividerState): ViewStyle {
  return getDividerLineStyle(state, 'after');
}

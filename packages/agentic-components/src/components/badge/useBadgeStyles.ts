import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  badgeStyles,
  getBadgeAppearanceStyle,
  getBadgeBackgroundStyle,
  getBadgeContentStyle,
  getBadgeForegroundStyle,
  getBadgeIconSize,
  getBadgeRootStyle,
} from './badge.styles';
import type { BadgeState } from './badge.types';

/**
 * Applies Badge styles and resolved slot props.
 */
export function useBadgeStyles_unstable(state: BadgeState) {
  const { size, userStyle } = state;
  const colors = {
    background: getBadgeBackgroundStyle(state),
    foreground: getBadgeForegroundStyle(state),
  };
  const rootStyle: StyleProp<ViewStyle> = [
    badgeStyles.root,
    getBadgeRootStyle(state),
    getBadgeAppearanceStyle(state),
    colors.background,
    userStyle,
  ];
  const contentStyle: StyleProp<TextStyle> = [badgeStyles.content, getBadgeContentStyle(state), colors.foreground];
  const iconSize = getBadgeIconSize(size);

  attachSlotProps(state.root, { style: rootStyle });
  if (state.leadingIcon) {
    attachSlotProps(state.leadingIcon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.trailingIcon) {
    attachSlotProps(state.trailingIcon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, {
      style: contentStyle,
    });
  }
}

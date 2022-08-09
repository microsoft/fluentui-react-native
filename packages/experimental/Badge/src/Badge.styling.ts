import {
  badgeName,
  BadgeCoreTokens,
  BadgeTokens,
  BadgeSlotProps,
  BadgeProps,
  BadgeColors,
  BadgeSizes,
  BadgeShapes,
  BadgeAppearances,
} from './Badge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from './BadgeTokens';
import { defaultBadgeColorTokens } from './BadgeColorTokens';

export const coreBadgeStates: (keyof BadgeCoreTokens)[] = [...BadgeSizes, ...BadgeShapes];
export const badgeStates: (keyof BadgeTokens)[] = [...coreBadgeStates, ...BadgeColors, ...BadgeAppearances];

export const stylingSettings: UseStylingOptions<BadgeProps, BadgeSlotProps, BadgeTokens> = {
  tokens: [defaultBadgeTokens, defaultBadgeColorTokens, badgeName],
  states: badgeStates,
  slotProps: {
    root: buildProps(
      (tokens: BadgeTokens, theme: Theme) => ({
        style: {
          ...getBadgePosition(tokens),
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          minHeight: tokens.minHeight,
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', 'height', 'bottom', 'right', 'top', 'left', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    icon: buildProps(
      (tokens: BadgeTokens) => ({
        color: tokens.iconColor || tokens.color,
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconSize', 'iconColor', 'color'],
    ),
    text: buildProps(
      (tokens: BadgeTokens, theme: Theme) => ({
        ...fontStyles.from(tokens, theme),
        color: tokens.color,
        paddingHorizontal: tokens.textPadding,
      }),
      ['color', 'textPadding', ...fontStyles.keys],
    ),
  },
};

export function getBadgePosition(tokens: BadgeCoreTokens) {
  const verticalPosition =
    tokens.top !== undefined
      ? {
          top: tokens.top,
        }
      : tokens.bottom !== undefined
      ? {
          bottom: tokens.bottom,
        }
      : {};
  const horizontalPosition =
    tokens.left !== undefined
      ? {
          left: tokens.left,
        }
      : tokens.right !== undefined
      ? {
          right: tokens.right,
        }
      : {};

  return {
    ...verticalPosition,
    ...horizontalPosition,
  };
}

import type { UseStylingOptions, Theme } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';

import { badgeName, BadgeColors, BadgeSizes, BadgeShapes, BadgeAppearances } from './Badge.types';
import type { BadgeCoreTokens, BadgeTokens, BadgeSlotProps, BadgeProps, BadgeConfigurableProps, BadgeNamedColor } from './Badge.types';
import { defaultBadgeColorTokens } from './BadgeColorTokens';
import { badgeFontTokens } from './BadgeFontTokens';
import { defaultBadgeTokens } from './BadgeTokens';

export const coreBadgeStates: (keyof BadgeCoreTokens)[] = [...BadgeSizes, ...BadgeShapes];
export const badgeStates: (keyof BadgeTokens)[] = [...coreBadgeStates, ...BadgeColors, ...BadgeAppearances, 'rtl', 'shadowToken'];
const tokensThatAreAlsoProps: (keyof BadgeConfigurableProps)[] = ['badgeColor', 'color', 'icon', 'iconColor', 'iconPosition', 'position'];

export const stylingSettings: UseStylingOptions<BadgeProps, BadgeSlotProps, BadgeTokens> = {
  tokens: [defaultBadgeTokens, defaultBadgeColorTokens, badgeFontTokens, badgeName],
  states: badgeStates,
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps(
      (tokens: BadgeTokens, theme: Theme) => {
        const { badgeColor, backgroundColor, position } = tokens;
        const _badgeColor = !badgeColor || BadgeColors.includes(badgeColor as BadgeNamedColor) ? backgroundColor : badgeColor;

        return {
          style: {
            ...getBadgePosition(tokens),
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            width: tokens.width,
            backgroundColor: _badgeColor,
            position,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
          },
        };
      },
      [
        'backgroundColor',
        'badgeColor',
        'width',
        'minHeight',
        'bottom',
        'right',
        'top',
        'left',
        'position',
        ...borderStyles.keys,
        ...layoutStyles.keys,
      ],
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
      (tokens: BadgeTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            color: tokens.color,
            ...getTextMargin(tokens),
          },
        };
      },
      ['color', 'textMargin', ...fontStyles.keys],
    ),
    shadow: buildProps(
      (tokens: BadgeTokens) => ({
        shadowToken: tokens.shadowToken,
      }),
      ['shadowToken'],
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

export function getTextMargin(tokens: BadgeTokens) {
  if (tokens.icon) {
    return tokens.iconPosition === 'before'
      ? {
          marginStart: tokens.textMargin,
        }
      : {
          marginEnd: tokens.textMargin,
        };
  }
  return {};
}

import { badgeName, BadgeCoreTokens, BadgeTokens, BadgeSlotProps, BadgeProps } from './Badge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from './BadgeTokens';
import { defaultBadgeColorTokens } from './BadgeColorTokens';

export const coreBadgeStates: (keyof BadgeCoreTokens)[] = [
  'smallest',
  'smaller',
  'small',
  'medium',
  'large',
  'largest',
  'rounded',
  'circular',
  'square',
  'iconColor',
];
export const badgeStates: (keyof BadgeTokens)[] = [
  'hovered',
  'focused',
  'filled',
  'outline',
  'tint',
  'ghost',
  'filledInverted',
  ...coreBadgeStates,
];

export const stylingSettings: UseStylingOptions<BadgeProps, BadgeSlotProps, BadgeTokens> = {
  tokens: [defaultBadgeTokens, defaultBadgeColorTokens, badgeName],
  states: badgeStates,
  slotProps: {
    root: buildProps(
      (tokens: BadgeTokens, theme: Theme) => ({
        style: {
          ...getBadgePosition(tokens),
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          height: tokens.height,
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', 'height', 'bottom', 'right', 'top', 'left', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    icon: buildProps(
      (tokens: BadgeTokens, theme: Theme) => ({
        style: {
          height: tokens.iconSize,
          width: tokens.iconSize,
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['width', 'height', ...layoutStyles.keys],
    ),
    text: buildProps(
      (tokens: BadgeTokens) => ({
        variant: tokens.variant,
        color: tokens.color,
      }),
      ['variant', 'color'],
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

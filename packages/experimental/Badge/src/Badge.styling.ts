import { badgeName, BadgeTokens, BadgeSlotProps, BadgeProps } from './Badge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from './BadgeTokens';
import { defaultBadgeColorTokens } from './BadgeColorTokens';

export const badgeStates: (keyof BadgeTokens)[] = [
  'hovered',
  'focused',
  'filled',
  'outline',
  'tint',
  'ghost',
  'filledInverted',
  'smallest',
  'smaller',
  'small',
  'medium',
  'large',
  'largest',
  'rounded',
  'circular',
  'square',
];

export const stylingSettings: UseStylingOptions<BadgeProps, BadgeSlotProps, BadgeTokens> = {
  tokens: [defaultBadgeTokens, defaultBadgeColorTokens, badgeName],
  states: badgeStates,
  slotProps: {
    root: buildProps(
      (tokens: BadgeTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          height: tokens.height,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'height', ...borderStyles.keys, ...layoutStyles.keys],
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
      [],
    ),
  },
};

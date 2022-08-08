import { CounterBadgeTokens, CounterBadgeProps, CounterBadgeSlotProps, counterBadgeName } from './CounterBadge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from '../BadgeTokens';
import { defaultBadgeColorTokens } from '../BadgeColorTokens';
import { badgeStates, getBadgePosition } from '../Badge.styling';

export const counterBadgeStates: (keyof CounterBadgeTokens)[] = [...badgeStates];

export const stylingSettings: UseStylingOptions<CounterBadgeProps, CounterBadgeSlotProps, CounterBadgeTokens> = {
  tokens: [defaultBadgeTokens, defaultBadgeColorTokens, counterBadgeName],
  states: counterBadgeStates,
  slotProps: {
    root: buildProps(
      (tokens: CounterBadgeTokens, theme: Theme) => ({
        style: {
          ...getBadgePosition(tokens),
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
      (tokens: CounterBadgeTokens) => ({
        color: tokens.iconColor || tokens.color,
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconSize', 'iconColor', 'color'],
    ),
    text: buildProps(
      (tokens: CounterBadgeTokens) => ({
        variant: tokens.variant,
        color: tokens.color,
      }),
      ['variant', 'color'],
    ),
  },
};

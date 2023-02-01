import type { PresenceBadgeTokens, PresenceBadgeSlotProps, PresenceBadgeProps } from './PresenceBadge.types';
import { presenceBadgeName, PresenceBadgeStatuses } from './PresenceBadge.types';
import type { BadgeConfigurableProps } from '../Badge.types';
import type { UseStylingOptions, Theme } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from '../BadgeTokens';
import { defaultPresenceBadgeTokens } from './PresenceBadgeTokens';
import { coreBadgeStates, getBadgePosition } from '../Badge.styling';

export const badgeStates: (keyof PresenceBadgeTokens)[] = [...coreBadgeStates, ...PresenceBadgeStatuses];
const tokensThatAreAlsoProps: (keyof BadgeConfigurableProps)[] = ['position'];

export const stylingSettings: UseStylingOptions<PresenceBadgeProps, PresenceBadgeSlotProps, PresenceBadgeTokens> = {
  tokens: [defaultBadgeTokens, presenceBadgeName, defaultPresenceBadgeTokens],
  tokensThatAreAlsoProps,
  states: badgeStates,
  slotProps: {
    root: buildProps(
      (tokens: PresenceBadgeTokens, theme: Theme) => {
        const { width, height, borderWidth } = tokens;
        const borderGap = borderWidth * 2;
        return {
          style: {
            ...getBadgePosition(tokens),
            width: width + borderGap,
            height: height + borderGap,
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            position: tokens.position,
            backgroundColor: tokens.backgroundColor,
            ...borderStyles.from(tokens, theme),
            paddingHorizontal: tokens.paddingHorizontal,
            aspectRatio: 1,
          },
        };
      },
      ['backgroundColor', 'width', 'height', 'bottom', 'right', 'top', 'left', 'paddingHorizontal', ...borderStyles.keys],
    ),
    svg: buildProps(
      (tokens: PresenceBadgeTokens) => ({
        style: {
          width: tokens.width,
          height: tokens.height,
          color: tokens.iconColor,
          aspectRatio: 1,
        },
      }),
      ['width', 'height', 'iconColor'],
    ),
  },
};

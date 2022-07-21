import { PresenceBadgeTokens, PresenceBadgeSlotProps, PresenceBadgeProps, presenceBadgeName } from './PresenceBadge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from '../BadgeTokens';
import { defaultPresenceBadgeTokens } from './PresenceBadgeTokens';
import { coreBadgeStates, getBadgePosition } from '../Badge.styling';

export const badgeStates: (keyof PresenceBadgeTokens)[] = [
  ...coreBadgeStates,
  'doNotDisturb',
  'busy',
  'unknown',
  'blocked',
  'outOfOffice',
  'away',
  'available',
  'offline',
  'awayOutOfOffice',
];

export const stylingSettings: UseStylingOptions<PresenceBadgeProps, PresenceBadgeSlotProps, PresenceBadgeTokens> = {
  tokens: [defaultBadgeTokens, presenceBadgeName, defaultPresenceBadgeTokens],
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
            position: 'absolute',
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

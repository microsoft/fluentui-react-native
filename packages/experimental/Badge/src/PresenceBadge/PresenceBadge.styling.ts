import { PresenceBadgeTokens, PresenceBadgeSlotProps, PresenceBadgeProps, presenceBadgeName } from './PresenceBadge.types';
import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultBadgeTokens } from '../BadgeTokens';
import { defaultPresenceBadgeTokens } from './PresenceBadgeTokens';
import { coreBadgeStates, getBadgePosition } from '../Badge.styling';

export const stylingSettings: UseStylingOptions<PresenceBadgeProps, PresenceBadgeSlotProps, PresenceBadgeTokens> = {
  tokens: [defaultBadgeTokens, presenceBadgeName, defaultPresenceBadgeTokens],
  states: coreBadgeStates,
  slotProps: {
    root: buildProps(
      (tokens: PresenceBadgeTokens, theme: Theme) => ({
        style: {
          ...getBadgePosition(tokens),
          width: tokens.width,
          height: tokens.height,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          position: 'absolute',
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', 'height', 'bottom', 'right', 'top', 'left', ...borderStyles.keys, ...layoutStyles.keys],
    ),
  },
};

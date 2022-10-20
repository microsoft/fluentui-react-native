import { fabName, FABProps, FABSlotProps, FABTokens } from './FAB.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { defaultFABTokens } from './FABTokens';
import { defaultFABColorTokens } from './FABColorTokens';

export const FABStates: (keyof FABTokens)[] = ['focused', 'pressed', 'subtle', 'disabled', 'large', 'small'];

export const stylingSettings: UseStylingOptions<FABProps, FABSlotProps, FABTokens> = {
  tokens: [defaultFABTokens, defaultFABColorTokens, fabName],
  states: FABStates,
  slotProps: {
    root: buildProps(
      (tokens: FABTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
          ...shadowStyles.from(tokens, theme),
        },
        elevation: tokens.elevation,
      }),
      ['backgroundColor', 'width', 'elevation', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    content: buildProps(
      (tokens: FABTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...getTextMarginAdjustment(),
          ...(tokens.spacingIconContentBefore && { marginStart: tokens.spacingIconContentBefore }),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'spacingIconContentBefore', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: FABTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
    shadow: buildProps(
      (tokens: FABTokens) => ({
        shadowToken: tokens.shadowToken,
      }),
      ['shadowToken'],
    ),
  },
};

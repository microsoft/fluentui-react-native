import { ButtonCoreTokens } from '../Button.types';
import { FABProps, FABSlotProps } from './FAB.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { buttonCoreStates } from '../Button.styling';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { Platform } from 'react-native';
import { defaultFABTokens } from './FABTokens';
import { defaultFABColorTokens } from './FABColorTokens';

export const stylingSettings: UseStylingOptions<FABProps, FABSlotProps, ButtonCoreTokens> = {
  tokens: [defaultFABTokens, defaultFABColorTokens],
  states: [...buttonCoreStates],
  slotProps: {
    ...(Platform.OS == 'android' && {
      rippleContainer: buildProps(
        (tokens: ButtonCoreTokens) => {
          return {
            style: {
              flexDirection: 'row',
              alignSelf: 'baseline',
              borderRadius: tokens.borderRadius,
              overflow: 'hidden',
            },
          };
        },
        ['borderRadius'],
      ),
    }),
    root: buildProps(
      (tokens: ButtonCoreTokens, theme: Theme) => ({
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
        android_ripple: {
          color: tokens.rippleColor,
        },
        elevation: tokens.elevation,
      }),
      ['backgroundColor', 'width', 'elevation', 'rippleColor', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    content: buildProps(
      (tokens: ButtonCoreTokens, theme: Theme) => ({
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
      (tokens: ButtonCoreTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
    shadow: buildProps(
      (tokens: ButtonCoreTokens) => ({
        shadowToken: tokens.shadowToken,
      }),
      ['shadowToken'],
    ),
  },
};

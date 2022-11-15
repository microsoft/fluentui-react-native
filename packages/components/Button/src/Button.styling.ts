import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps, ButtonSize, ButtonAppearance } from './Button.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, FontTokens } from '@fluentui-react-native/tokens';
import { defaultButtonTokens } from './ButtonTokens';
import { defaultButtonColorTokens } from './ButtonColorTokens';
import { Platform, ColorValue } from 'react-native';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { defaultButtonFontTokens } from './ButtonFontTokens';

export const buttonStates: (keyof ButtonTokens)[] = [
  'block',
  'primary',
  'subtle',
  'outline',
  'hovered',
  'small',
  'medium',
  'large',
  'hasContent',
  'hasIconAfter',
  'hasIconBefore',
  'rounded',
  'circular',
  'square',
  'focused',
  'pressed',
  'disabled',
];

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [defaultButtonTokens, defaultButtonFontTokens, defaultButtonColorTokens, buttonName],
  states: buttonStates,
  slotProps: {
    ...(Platform.OS == 'android' && {
      rippleContainer: buildProps(
        (tokens: ButtonTokens) => {
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
      (tokens: ButtonTokens, theme: Theme) => ({
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
        },
        android_ripple: {
          color: tokens.rippleColor,
        },
      }),
      ['backgroundColor', 'width', 'rippleColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    content: buildProps(
      (tokens: ButtonTokens, theme: Theme) => {
        return {
          style: {
            ...contentStyling(tokens, theme, tokens.color, tokens),
          },
        };
      },
      ['color', 'spacingIconContentAfter', 'spacingIconContentBefore', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ButtonTokens) => ({
        color: tokens.iconColor,
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};

export const getDefaultSize = (): ButtonSize => {
  if (Platform.OS === 'windows') {
    return 'medium';
  } else if ((Platform.OS as any) === 'win32') {
    return 'small';
  }

  return 'medium';
};

export const getPlatformSpecificAppearance = (appearance: ButtonAppearance): ButtonAppearance => {
  switch (appearance) {
    case 'ascent': // Included to cover Mobile platform naming guidelines, maps to 'primary'.
      return 'primary';
    case 'outline': // Exists only for Mobile platforms, maps to default on other platforms.
      if (Platform.OS == 'android' || Platform.OS == 'ios') return 'outline';
      else return null;
    case 'primary':
    case 'subtle':
      return appearance;
    default: // Mobile platforms do not have seperate styling when no appearance is passed.
      if (Platform.OS == 'android' || Platform.OS == 'ios') return 'primary';
      else return null;
  }
};

export const contentStyling = (tokens: ButtonTokens, theme: Theme, contentColor: ColorValue, fontStylesTokens: FontTokens) => {
  const textAdjustment = getTextMarginAdjustment();
  const spacingIconContentBefore = tokens.spacingIconContentBefore
    ? {
        marginStart: textAdjustment.marginStart + tokens.spacingIconContentBefore,
      }
    : {};
  const spacingIconContentAfter = tokens.spacingIconContentAfter
    ? {
        marginEnd: textAdjustment.marginEnd + tokens.spacingIconContentAfter,
      }
    : {};
  return {
    color: contentColor,
    ...getTextMarginAdjustment(),
    ...spacingIconContentBefore,
    ...spacingIconContentAfter,
    ...fontStyles.from(fontStylesTokens, theme),
  };
};

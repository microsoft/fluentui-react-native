import { buttonName, ButtonCoreTokens, ButtonTokens, ButtonSlotProps, ButtonProps, ButtonSize } from './Switch.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles, FontTokens } from '@fluentui-react-native/tokens';
import { defaultButtonTokens } from './SwitchTokens';
import { defaultButtonColorTokens } from './SwitchColorTokens';
import { Platform, ColorValue } from 'react-native';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { defaultButtonFontTokens } from './SwitchFontTokens';

export const buttonCoreStates: (keyof ButtonCoreTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'hasContent', 'hasIconBefore'];

export const buttonStates: (keyof ButtonTokens)[] = [
  'block',
  'primary',
  'subtle',
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
  'checked',
];

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [defaultButtonTokens, defaultButtonFontTokens, defaultButtonColorTokens, buttonName],
  states: buttonStates,
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          height: 14,
          borderRadius: 50,
          width: 38,
          backgroundColor: tokens.backgroundColor,
          borderColor: 'black',
          borderWidth: 1,
          padding: 2,
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
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
    thumb: buildProps(
      () => ({
        style: {
          backgroundColor: 'red',
          height: 8,
          width: 8,
          borderRadius: 12.5,
        },
      }),
      ['backgroundColor'],
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

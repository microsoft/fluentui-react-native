import { buttonName, ButtonCoreTokens, ButtonTokens, ButtonSlotProps, ButtonProps, ButtonSize } from './Toggle.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles, FontTokens } from '@fluentui-react-native/tokens';
import { defaultButtonTokens } from './ToggleTokens';
import { defaultButtonColorTokens } from './ToggleColorTokens';
import { Platform, ColorValue } from 'react-native';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { defaultButtonFontTokens } from './ToggleFontTokens';

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
          ...shadowStyles.from(tokens, theme),
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
          height: 10,
          width: 10,
          borderRadius: 25,
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

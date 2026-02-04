import type { TextProps, TextStyle } from 'react-native';

import type { ITextProps, ITextStyle } from '@fluentui-react-native/adapters';
import type { Theme, Typography } from '@fluentui-react-native/theme-types';

import { styleFunction } from './token.function';
import type { TokenBuilder } from './tokenBuilder';

export interface FontVariantTokens {
  variant?: keyof Typography['variants'];
}

export interface FontStyleTokens {
  fontFamily?: keyof Typography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof Typography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof Typography['weights'] | TextStyle['fontWeight'];
  fontLineHeight?: TextStyle['lineHeight'];
  fontLetterSpacing?: TextStyle['letterSpacing'];
  fontStyle?: TextStyle['fontStyle'];
  // Props below are used on iOS only
  fontDynamicTypeRamp?: TextProps['dynamicTypeRamp'];
  fontMaximumSize?: number;
}

export interface FontDecorationTokens {
  textDecorationLine?: TextStyle['textDecorationLine'];
}

export type FontTokens = FontStyleTokens & FontVariantTokens & FontDecorationTokens;

export const fontStyles: TokenBuilder<FontTokens, ITextStyle> = {
  from: (
    {
      fontDynamicTypeRamp,
      fontFamily,
      fontLetterSpacing,
      fontLineHeight,
      fontMaximumSize,
      fontSize,
      fontStyle,
      fontWeight,
      textDecorationLine,
      variant,
    }: FontTokens,
    { typography }: Theme,
  ) => {
    const { families, sizes, weights, variants } = typography;
    if (
      fontDynamicTypeRamp !== undefined ||
      fontFamily !== undefined ||
      fontLetterSpacing !== undefined ||
      fontLineHeight !== undefined ||
      fontMaximumSize !== undefined ||
      fontSize !== undefined ||
      fontWeight !== undefined ||
      variant !== undefined
    ) {
      return {
        fontFamily: families[fontFamily] ?? fontFamily ?? families[variants[variant]?.face] ?? variants[variant]?.face,
        fontSize: sizes[fontSize] ?? fontSize ?? sizes[variants[variant]?.size] ?? variants[variant]?.size,
        fontStyle: fontStyle,
        fontWeight: weights[fontWeight] ?? fontWeight ?? weights[variants[variant]?.weight] ?? variants[variant]?.weight,
        lineHeight: fontLineHeight ?? variants[variant]?.lineHeight,
        letterSpacing: fontLetterSpacing ?? variants[variant]?.letterSpacing,
        dynamicTypeRamp: fontDynamicTypeRamp ?? variants[variant]?.dynamicTypeRamp,
        maximumFontSize: fontMaximumSize,
        textDecorationLine,
      };
    }

    return {};
  },
  keys: [
    'fontDynamicTypeRamp',
    'fontFamily',
    'fontLineHeight',
    'fontLetterSpacing',
    'fontMaximumSize',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'variant',
    'textDecorationLine',
  ],
};

function _buildTextStyles(tokens: FontTokens, theme: Theme): ITextProps {
  return {
    style: fontStyles.from(tokens, theme),
  };
}

export const textTokens = styleFunction<ITextProps, FontTokens, Theme>(_buildTextStyles, fontStyles.keys);

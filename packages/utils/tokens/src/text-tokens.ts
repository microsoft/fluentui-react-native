import { TextStyle } from 'react-native';
import { ITextProps } from '@fluentui-react-native/adapters';
import { Theme, Typography } from '@fluentui-react-native/theme-types';
import { styleFunction } from './token.function';
import { TokenBuilder } from './tokenBuilder';

export interface FontVariantTokens {
  variant?: keyof Typography['variants'];
}

export interface FontStyleTokens {
  fontFamily?: keyof Typography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof Typography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof Typography['weights'] | TextStyle['fontWeight'];
  fontLineHeight?: TextStyle['lineHeight'];
  fontLetterSpacing?: TextStyle['letterSpacing'];
  fontDynamicTypeRamp?: string; // TODO(#2268): Import type from RN directly
}

export type FontTokens = FontStyleTokens & FontVariantTokens;

export const fontStyles: TokenBuilder<FontTokens> = {
  from: (
    { fontDynamicTypeRamp, fontFamily, fontLetterSpacing, fontLineHeight, fontSize, fontWeight, variant }: FontTokens,
    { typography }: Theme,
  ) => {
    const { families, sizes, weights, variants } = typography;
    if (
      fontDynamicTypeRamp !== undefined ||
      fontFamily !== undefined ||
      fontLetterSpacing !== undefined ||
      fontLineHeight !== undefined ||
      fontSize !== undefined ||
      fontWeight !== undefined ||
      variant !== undefined
    ) {
      return {
        fontFamily: families[fontFamily] ?? fontFamily ?? families[variants[variant]?.face] ?? variants[variant]?.face,
        fontSize: sizes[fontSize] ?? fontSize ?? sizes[variants[variant]?.size] ?? variants[variant]?.size,
        fontWeight: weights[fontWeight] ?? fontWeight ?? weights[variants[variant]?.weight] ?? variants[variant]?.weight,
        lineHeight: fontLineHeight ?? variants[variant]?.lineHeight,
        letterSpacing: fontLetterSpacing ?? variants[variant]?.letterSpacing,
        dynamicTypeRamp: fontDynamicTypeRamp ?? variants[variant]?.dynamicTypeRamp,
      };
    }

    return {};
  },
  keys: ['fontDynamicTypeRamp', 'fontFamily', 'fontLineHeight', 'fontLetterSpacing', 'fontSize', 'fontWeight', 'variant'],
};

function _buildTextStyles(tokens: FontTokens, theme: Theme): ITextProps {
  return {
    style: fontStyles.from(tokens, theme),
  };
}

export const textTokens = styleFunction<ITextProps, FontTokens, Theme>(_buildTextStyles, fontStyles.keys);

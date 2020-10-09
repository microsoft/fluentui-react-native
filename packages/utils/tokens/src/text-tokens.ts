import { TextProps } from 'react-native';
import { ITheme } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { TokenBuilder } from './tokenBuilder';
import { FontStyleTokenSet, FontTokenSet, FontVariantTokenSet } from '@fluentui-react-native/theme-types';

export type FontVariantTokens = FontVariantTokenSet;

export type FontStyleTokens = FontStyleTokenSet;
export type FontTokens = FontTokenSet;

export const fontStyles: TokenBuilder<FontTokens> = {
  from: ({ fontFamily, fontSize, fontWeight, variant }: FontTokens, { typography }: ITheme) => {
    const { families, sizes, weights, variants } = typography;
    if (fontFamily || fontSize || fontWeight || variant) {
      return {
        fontFamily: families[fontFamily] || fontFamily || families[variants[variant].face] || variants[variant].face,
        fontSize: sizes[fontSize] || fontSize || sizes[variants[variant].size] || variants[variant].size,
        fontWeight: weights[fontWeight] || fontWeight || weights[variants[variant].weight] || variants[variant].weight,
      };
    }

    return {};
  },
  keys: ['fontFamily', 'fontSize', 'fontWeight', 'variant'],
};

function _buildTextStyles(tokens: FontTokens, theme: ITheme): TextProps {
  return {
    style: fontStyles.from(tokens, theme),
  };
}

export const textTokens = styleFunction<TextProps, FontTokens, ITheme>(_buildTextStyles, fontStyles.keys);

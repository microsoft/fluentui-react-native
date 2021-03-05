import { TextStyle } from 'react-native';
import { ITextProps } from '@fluentui-react-native/adapters';
import { ITheme, ITypography } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { TokenBuilder } from './tokenBuilder';

export interface FontVariantTokens {
  variant?: keyof ITypography['variants'];
}

export interface FontStyleTokens {
  fontFamily?: keyof ITypography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof ITypography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof ITypography['weights'] | TextStyle['fontWeight'];
}

export type FontTokens = FontStyleTokens & FontVariantTokens;

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

function _buildTextStyles(tokens: FontTokens, theme: ITheme): ITextProps {
  return {
    style: fontStyles.from(tokens, theme),
  };
}

export const textTokens = styleFunction<ITextProps, FontTokens, ITheme>(_buildTextStyles, fontStyles.keys);

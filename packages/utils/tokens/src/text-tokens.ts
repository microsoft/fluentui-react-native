import { TextStyle } from 'react-native';
import { ITextProps } from '@fluentui-react-native/adapters';
import { Theme, Typography } from '@fluentui-react-native/theme-types';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { TokenBuilder } from './tokenBuilder';

export interface FontVariantTokens {
  variant?: keyof Typography['variants'];
}

export interface FontStyleTokens {
  fontFamily?: keyof Typography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof Typography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof Typography['weights'] | TextStyle['fontWeight'];
}

export type FontTokens = FontStyleTokens & FontVariantTokens;

export const fontStyles: TokenBuilder<FontTokens> = {
  from: ({ fontFamily, fontSize, fontWeight, variant }: FontTokens, { typography }: Theme) => {
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

function _buildTextStyles(tokens: FontTokens, theme: Theme): ITextProps {
  return {
    style: fontStyles.from(tokens, theme),
  };
}

export const textTokens = styleFunction<ITextProps, FontTokens, Theme>(_buildTextStyles, fontStyles.keys);

import { TextStyle, TextProps } from 'react-native';
import { ITheme, ITypography } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

export interface ITextVariantTokens {
  variant?: keyof ITypography['variants'];
}

export interface ITextStyleTokens {
  fontFamily?: keyof ITypography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof ITypography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof ITypography['weights'] | TextStyle['fontWeight'];
}

export type ITextTokens = ITextStyleTokens & ITextVariantTokens;

export function _buildTextStyles({ fontFamily, fontSize, fontWeight, variant }: ITextTokens, { typography }: ITheme): TextProps {
  const { families, sizes, weights, variants } = typography;
  if (fontFamily || fontSize || fontWeight || variant) {
    return {
      style: {
        fontFamily: families[fontFamily] || fontFamily || families[variants[variant].face] || variants[variant].face,
        fontSize: sizes[fontSize] || fontSize || sizes[variants[variant].size] || variants[variant].size,
        fontWeight: weights[fontWeight] || fontWeight || weights[variants[variant].weight] || variants[variant].weight
      }
    };
  }

  return {};
}

const _keyProps: (keyof ITextTokens)[] = ['fontFamily', 'fontSize', 'fontWeight', 'variant'];

export const textTokens = styleFunction<TextProps, ITextTokens, ITheme>(_buildTextStyles, _keyProps);

import { TextStyle, TextProps } from 'react-native';
import { ITheme, ITypography } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

export interface ITextVariantTokens {
  fontVariant?: keyof ITypography['variants'];
}

export interface ITextStyleTokens {
  fontFamily?: keyof ITypography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof ITypography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof ITypography['weights'] | TextStyle['fontWeight'];
}

export type ITextTokens = ITextStyleTokens & ITextVariantTokens;

export function _buildTextStyles({ fontFamily, fontSize, fontWeight, fontVariant }: ITextTokens, { typography }: ITheme): TextProps {
  const { families, sizes, weights, variants } = typography;
  if (fontFamily || fontSize || fontWeight || fontVariant) {
    return {
      style: {
        fontFamily: families[fontFamily] || fontFamily || families[variants[fontVariant].face] || variants[fontVariant].face,
        fontSize: sizes[fontSize] || fontSize || sizes[variants[fontVariant].size] || variants[fontVariant].size,
        fontWeight: weights[fontWeight] || fontWeight || weights[variants[fontVariant].weight] || variants[fontVariant].weight
      }
    };
  }

  return {};
}

const _keyProps: (keyof ITextTokens)[] = ['fontFamily', 'fontSize', 'fontWeight', 'fontVariant'];

export const textTokens = styleFunction<TextProps, ITextTokens, ITheme>(_buildTextStyles, _keyProps);

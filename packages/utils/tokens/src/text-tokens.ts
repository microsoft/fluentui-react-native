import { TextStyle, TextProps } from 'react-native';
import { ITheme, ITypography } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

export interface ITextVariantTokens {
  fontVariant?: keyof ITypography['variants'] | string;
}

export interface ITextStyleTokens {
  fontFamily?: keyof ITypography['families'] | TextStyle['fontFamily'] | string;
  fontSize?: keyof ITypography['sizes'] | TextStyle['fontSize'] | string;
  fontWeight?: keyof ITypography['weights'] | TextStyle['fontWeight'] | string;
}

export type ITextTokens = ITextStyleTokens & ITextVariantTokens;

export function _buildTextStyles({ fontFamily, fontSize, fontWeight, fontVariant }: ITextTokens, theme: ITheme): TextProps {
  const { families, sizes, weights, variants } = theme.typography;
  if (fontFamily || fontSize || fontWeight || fontVariant) {
    return {
      style: {
        fontFamily: families[fontFamily] || fontFamily || variants[fontVariant].face,
        fontSize: sizes[fontSize] || fontSize || variants[fontVariant].size,
        fontWeight: weights[fontWeight] || fontWeight || variants[fontVariant].weight
      }
    };
  }

  return {};
}

const _keyProps: (keyof ITextTokens)[] = ['fontFamily', 'fontSize', 'fontWeight', 'fontVariant'];

export const textTokens = styleFunction<TextProps, ITextTokens, ITheme>(_buildTextStyles, _keyProps);

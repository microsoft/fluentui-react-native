import { TextStyle, TextProps } from 'react-native';
import { ITheme, ITypography } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

export interface ITextVariantTokens {
  fontVariant?: keyof ITypography['variants'];
}

export interface ITextStyleTokens {
  fontFamily?: TextStyle['fontFamily'] | string;
  fontSize?: TextStyle['fontSize'] | string;
  fontWeight?: TextStyle['fontWeight'] | string;
}

export type ITextTokens = ITextStyleTokens & ITextVariantTokens;

export function _buildTextStyles(tokens: ITextTokens, theme: ITheme): TextProps {
  if (tokens.fontFamily || tokens.fontSize || tokens.fontWeight || tokens.fontVariant) {
    return {
      style: {
        fontFamily: tokens.fontFamily
          ? theme.typography.families[tokens.fontFamily] || tokens.fontFamily
          : theme.typography.variants[tokens.fontVariant].face,
        fontSize: tokens.fontSize
          ? theme.typography.sizes[tokens.fontSize] || tokens.fontSize
          : theme.typography.variants[tokens.fontVariant].size,
        fontWeight: tokens.fontWeight
          ? theme.typography.weights[tokens.fontWeight] || tokens.fontWeight
          : theme.typography.variants[tokens.fontVariant].weight
      }
    };
  }

  return {};
}

const _keyProps: (keyof ITextTokens)[] = ['fontFamily', 'fontSize', 'fontWeight', 'fontVariant'];

export const textTokens = styleFunction<TextProps, ITextTokens, ITheme>(_buildTextStyles, _keyProps);

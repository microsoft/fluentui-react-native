import { TextStyle, TextProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { ITextTokens } from '../../tokens/TextTokens';
import { PersonaSize } from '..';
import { getTextFont, FontAttributes, getSecondaryFont, getTertiaryFont, getOptionalFont } from './Persona.helpers';

function buildTextStyleHelper(
  verticalGap: number | undefined,
  size: PersonaSize | undefined,
  getFontAttributes: (size: PersonaSize) => FontAttributes,
  fontTokens: ITextTokens | undefined,
  theme: ITheme
) {
  const textStyle: TextStyle = {};
  if (verticalGap && verticalGap > 0) {
    textStyle.marginBottom = verticalGap;
  }
  if (fontTokens) {
    const { fontFamily, fontSize, fontWeight } = fontTokens;
    textStyle.fontFamily = fontFamily && theme.typography.families[fontFamily];
    textStyle.fontSize = fontSize && theme.typography.sizes[fontSize];
    textStyle.fontWeight = fontWeight && theme.typography.weights[fontWeight];
  } else {
    const { fontFamily, fontSize, fontWeight } = getFontAttributes(size || 'size40');
    textStyle.fontFamily = fontFamily;
    textStyle.fontSize = fontSize;
    textStyle.fontWeight = fontWeight;
  }

  return textStyle;
}

function _buildTextStyle(tokenProps: IPersonaTokens, theme: ITheme): TextProps {
  const { verticalGap, textFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getTextFont, textFont, theme) };
}

function _buildSecondaryStyle(tokenProps: IPersonaTokens, theme: ITheme): TextProps {
  const { verticalGap, secondaryFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getSecondaryFont, secondaryFont, theme) };
}

function _buildTertiaryStyle(tokenProps: IPersonaTokens, theme: ITheme): TextProps {
  const { verticalGap, tertiaryFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getTertiaryFont, tertiaryFont, theme) };
}

function _buildOptionalStyle(tokenProps: IPersonaTokens, theme: ITheme): TextProps {
  const { optionalFont, size } = tokenProps;
  return { style: buildTextStyleHelper(undefined, size, getOptionalFont, optionalFont, theme) };
}

export const buildTextStyle = styleFunction<TextProps, IPersonaTokens, ITheme>(_buildTextStyle, ['size', 'textFont', 'verticalGap']);
export const buildSecondaryStyle = styleFunction<TextProps, IPersonaTokens, ITheme>(_buildSecondaryStyle, [
  'size',
  'secondaryFont',
  'verticalGap'
]);
export const buildTertiaryStyle = styleFunction<TextProps, IPersonaTokens, ITheme>(_buildTertiaryStyle, [
  'size',
  'tertiaryFont',
  'verticalGap'
]);
export const buildOptionalStyle = styleFunction<TextProps, IPersonaTokens, ITheme>(_buildOptionalStyle, ['size', 'optionalFont']);

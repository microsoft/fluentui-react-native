import { TextStyle, TextProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { FontTokens } from '@fluentui-react-native/tokens';
import { PersonaSize } from '@fluentui-react-native/persona-coin';
import { getTextFont, getSecondaryFont, getTertiaryFont, getOptionalFont } from './Persona.helpers';

function buildTextStyleHelper(
  verticalGap: number | undefined,
  size: PersonaSize | undefined,
  getFontAttributes: (size: PersonaSize) => FontTokens,
  fontTokens: FontTokens | undefined,
  theme: ITheme
) {
  const textStyle: TextStyle = {};

  if (verticalGap !== undefined) {
    textStyle.marginBottom = verticalGap;
  }

  const { fontFamily, fontSize, fontWeight } = fontTokens || getFontAttributes(size || 'size40');
  textStyle.fontFamily = fontFamily && (theme.typography.families[fontFamily] || fontFamily);
  textStyle.fontSize = fontSize && (typeof fontSize === 'string' ? theme.typography.sizes[fontSize] : fontSize);
  textStyle.fontWeight = fontWeight && (theme.typography.weights[fontWeight] || fontWeight);

  if (textStyle.fontSize === 0) {
    textStyle.display = 'none';
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

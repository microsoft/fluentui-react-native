import { TextStyle } from 'react-native';
import type { ITextProps } from '@fluentui-react-native/adapters';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { Theme } from '@fluentui-react-native/framework';
import { FontTokens } from '@fluentui-react-native/tokens';
import { PersonaSize } from '@fluentui-react-native/persona-coin';
import { getTextFont, getSecondaryFont, getTertiaryFont, getOptionalFont } from './Persona.helpers';

function buildTextStyleHelper(
  verticalGap: number | undefined,
  size: PersonaSize | undefined,
  getFontAttributes: (size: PersonaSize) => FontTokens,
  fontTokens: FontTokens | undefined,
  theme: Theme,
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
    textStyle.fontSize = undefined;
  }

  return textStyle;
}

function _buildTextStyle(tokenProps: IPersonaTokens, theme: Theme): ITextProps {
  const { verticalGap, textFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getTextFont, textFont, theme) };
}

function _buildSecondaryStyle(tokenProps: IPersonaTokens, theme: Theme): ITextProps {
  const { verticalGap, secondaryFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getSecondaryFont, secondaryFont, theme) };
}

function _buildTertiaryStyle(tokenProps: IPersonaTokens, theme: Theme): ITextProps {
  const { verticalGap, tertiaryFont, size } = tokenProps;
  return { style: buildTextStyleHelper(verticalGap, size, getTertiaryFont, tertiaryFont, theme) };
}

function _buildOptionalStyle(tokenProps: IPersonaTokens, theme: Theme): ITextProps {
  const { optionalFont, size } = tokenProps;
  return { style: buildTextStyleHelper(undefined, size, getOptionalFont, optionalFont, theme) };
}

export const buildTextStyle = styleFunction<ITextProps, IPersonaTokens, Theme>(_buildTextStyle, ['size', 'textFont', 'verticalGap']);
export const buildSecondaryStyle = styleFunction<ITextProps, IPersonaTokens, Theme>(_buildSecondaryStyle, [
  'size',
  'secondaryFont',
  'verticalGap',
]);
export const buildTertiaryStyle = styleFunction<ITextProps, IPersonaTokens, Theme>(_buildTertiaryStyle, [
  'size',
  'tertiaryFont',
  'verticalGap',
]);
export const buildOptionalStyle = styleFunction<ITextProps, IPersonaTokens, Theme>(_buildOptionalStyle, ['size', 'optionalFont']);

import type { ColorValue } from 'react-native';

/**
 * Base structure of a shadow style, which has x and y offset, blur amount, and color specified
 */
export interface ShadowValue {
  x: number;
  y: number;
  blur: number;
  color: ColorValue;
}

/**
 * In FluentUI a shadow is specified as having two parts - an ambient shadow and a key shadow.
 * The ambient shadow is shading around the entire control
 * The key shadow is the offset shadow which gives the control a sense of elevation or distance from the page
 */
export interface ShadowToken {
  ambient: ShadowValue;
  key: ShadowValue;
}

/**
 * Shadows alias tokens as defined by FluentUI v2 design system
 */
export interface BaseShadowAliasTokens {
  shadow2: ShadowToken;
  shadow4: ShadowToken;
  shadow8: ShadowToken;
  shadow16: ShadowToken;
  shadow28: ShadowToken;
  shadow64: ShadowToken;
  shadow2brand: ShadowToken;
  shadow4brand: ShadowToken;
  shadow8brand: ShadowToken;
  shadow16brand: ShadowToken;
  shadow28brand: ShadowToken;
  shadow64brand: ShadowToken;
}

/**
 * Shadows on the theme object. This allows for flexibility on entries but retains base alias tokens
 */
export type ThemeShadowDefinition = BaseShadowAliasTokens & {
  [key: string]: ShadowToken;
};

/**
 * A partially specified shadow definition.
 */
export type PartialShadowDefinition = { [P in keyof ThemeShadowDefinition]?: Partial<ThemeShadowDefinition[P]> };

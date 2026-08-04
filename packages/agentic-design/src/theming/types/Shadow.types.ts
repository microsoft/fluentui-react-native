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
  /**
   * Used by: Button (defaultFABTokens), tester-core (ShadowDepthTestSection)
   */
  shadow2: ShadowToken;
  /**
   * Used by: tester-core (BasicBadge, ShadowDepthTestSection)
   */
  shadow4: ShadowToken;
  /**
   * Used by: Button (defaultFABTokens), Switch (defaultSwitchTokens), tester-core (ShadowDepthTestSection)
   */
  shadow8: ShadowToken;
  /**
   * Used by: Notification (defaultNotificationTokens), tester-core (BasicBadge, ShadowDepthTestSection,
   *   ShadowWithDifferentPropsTestSection)
   */
  shadow16: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow28: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow64: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow2brand: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow4brand: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow8brand: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow16brand: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
  shadow28brand: ShadowToken;
  /**
   * Used by: tester-core (ShadowDepthTestSection)
   */
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

import type { ColorValue, FlexStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { TextProps } from '@fluentui-react-native/text';
import type { ShadowToken } from '@fluentui-react-native/theme-types';
import type { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const badgeName = 'Badge';
export const BadgeSizes = ['tiny', 'extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const;
export const BadgeAppearances = ['filled', 'outline', 'tint', 'ghost'] as const;
export const BadgeShapes = ['rounded', 'circular', 'square'] as const;
export const BadgeColors = ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'] as const;
export type BadgeNamedColor = (typeof BadgeColors)[number];
export type BadgeSize = (typeof BadgeSizes)[number];
export type BadgeAppearance = (typeof BadgeAppearances)[number];
export type BadgeShape = (typeof BadgeShapes)[number];
export type BadgeColor = BadgeNamedColor | ColorValue;
export type BadgeIconPosition = 'before' | 'after';

export interface BadgeConfigurableProps {
  /**
   * A Badge can be one of preset colors
   * @defaultvalue brand
   */
  badgeColor?: BadgeColor;

  /**
   * Set the text color
   */
  color?: ColorValue;

  /*
   * Source URL or name of the icon to show on the Badge.
   */
  icon?: IconSourcesType;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * Icon can be placed before or after Badge's content.
   * @default before
   */
  iconPosition?: BadgeIconPosition;

  /**
   * Badge position
   * @defaultvalue absolute
   */
  position?: FlexStyle['position'];
}

export interface BadgeCoreProps extends IViewProps {
  /**
   * A Badge can be square, circular or rounded.
   * @defaultvalue circular
   */
  shape?: BadgeShape;

  /** Sets style of Badge to a preset size style
   * @defaultvalue medium
   */
  size?: BadgeSize;
}

export interface BadgeProps extends BadgeCoreProps, BadgeConfigurableProps {
  /**
   * A Badge can have its content and borders styled for greater emphasis or to be subtle.
   * It can be filled, outline, ghost, inverted
   * @defaultvalue filled
   */
  appearance?: BadgeAppearance;
}

export interface BadgeCoreTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, Omit<IColorTokens, 'color'> {
  /**
   * Set the bottom edge of the Badge
   */
  bottom?: FlexStyle['bottom'];

  /**
   * The height of the Badge.
   */
  height?: number;

  /**
   * The icon size.
   */
  iconSize?: number;

  /**
   * Set the left edge of the Badge
   */
  left?: FlexStyle['left'];

  /**
   * Set the right edge of the Badge
   */
  right?: FlexStyle['right'];

  /**
   * Set padding for text container when Badge contains
   * icons or images
   */
  textMargin?: number;

  /**
   * Set the top edge of the Badge
   */
  top?: FlexStyle['top'];

  /**
   * Sets shadow style with `ambient` and `key` props
   */
  shadowToken?: ShadowToken;

  /**
   * The width of the Badge.
   */
  width?: number;

  /**
   * Sizes of the Badge
   */
  tiny?: BadgeTokens;
  extraSmall?: BadgeTokens;
  small?: BadgeTokens;
  medium?: BadgeTokens;
  large?: BadgeTokens;
  extraLarge?: BadgeTokens;

  /**
   * Shapes of the Badge
   */
  rounded?: BadgeTokens;
  circular?: BadgeTokens;
  square?: BadgeTokens;
}
export interface BadgeTokens extends BadgeCoreTokens, BadgeConfigurableProps {
  /*
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * When isRTL - applies Badge from the left side
   */
  rtl?: BadgeTokens;

  /**
   * Additional states that can be applied to a Badge
   */
  filled?: BadgeTokens;
  outline?: BadgeTokens;
  tint?: BadgeTokens;
  ghost?: BadgeTokens;

  /**
   * Colors of the Badge
   */
  brand?: BadgeTokens;
  danger?: BadgeTokens;
  important?: BadgeTokens;
  informative?: BadgeTokens;
  severe?: BadgeTokens;
  subtle?: BadgeTokens;
  success?: BadgeTokens;
  warning?: BadgeTokens;
}

export interface BadgeSlotProps {
  root: IViewProps;
  icon?: IconProps;
  text: TextProps;
  shadow?: ShadowProps;
}

export interface BadgeType {
  props: BadgeProps;
  tokens: BadgeTokens;
  slotProps: BadgeSlotProps;
}

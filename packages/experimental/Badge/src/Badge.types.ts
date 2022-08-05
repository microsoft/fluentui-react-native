import { ColorValue, FlexStyle } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const badgeName = 'Badge';
export const BadgeSizes = ['tiny', 'extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const;
export const BadgeAppearances = ['filled', 'outline', 'tint', 'ghost'] as const;
export const BadgeShapes = ['rounded', 'circular', 'square'] as const;
export const BadgeColors = ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'] as const;
export type BadgeSize = typeof BadgeSizes[number];
export type BadgeAppearance = typeof BadgeAppearances[number];
export type BadgeShape = typeof BadgeShapes[number];
export type BadgeColor = typeof BadgeColors[number] | ColorValue;
export type BadgeIconPosition = 'before' | 'after';

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
export interface BadgeProps extends BadgeCoreProps {
  /**
   * A Badge can have its content and borders styled for greater emphasis or to be subtle.
   * It can be filled, outline, ghost, inverted
   * @defaultvalue filled
   */
  appearance?: BadgeAppearance;

  /**
   * A Badge can be one of preset colors
   * @defaultvalue brand
   */
  color?: BadgeColor;

  /*
   * Source URL or name of the icon to show on the Badge.
   */
  icon?: IconSourcesType;

  /**
   * Icon can be placed before or after Badge's content.
   * @default before
   */
  iconPosition?: BadgeIconPosition;
}
export interface BadgeCoreTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * Set the bottom edge of the Badge
   */
  bottom?: FlexStyle['bottom'];

  /**
   * The height of the Badge.
   */
  height?: number;
  /**
   * The icon color.
   */
  iconColor?: ColorValue;
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
  textPadding?: number;
  /**
   * Set the top edge of the Badge
   */
  top?: FlexStyle['top'];

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
export interface BadgeTokens extends BadgeCoreTokens {
  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

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
  icon: IconProps;
  text: TextProps;
}

export interface BadgeType {
  props: BadgeProps;
  tokens: BadgeTokens;
  slotProps: BadgeSlotProps;
}

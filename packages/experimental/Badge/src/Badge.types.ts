import { ColorValue, FlexStyle } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const badgeName = 'Badge';
export const BadgeSizes = ['smallest', 'smaller', 'small', 'medium', 'large', 'largest'] as const;
export const BadgeAppearances = ['filled', 'outline', 'tint', 'ghost', 'filledInverted'] as const;
export const BadgeShapes = ['rounded', 'circular', 'square'] as const;
export type BadgeSize = typeof BadgeSizes[number];
export type BadgeAppearance = typeof BadgeAppearances[number];
export type BadgeShape = typeof BadgeShapes[number];

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
   * Set the left edge of the Badge
   */
  left?: FlexStyle['left'];

  /**
   * Set the right edge of the Badge
   */
  right?: FlexStyle['right'];

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
  smallest?: BadgeTokens;
  smaller?: BadgeTokens;
  small?: BadgeTokens;
  medium?: BadgeTokens;
  large?: BadgeTokens;
  largest?: BadgeTokens;

  /**
   * Shapes of the Badge
   */
  rounded?: BadgeTokens;
  circular?: BadgeTokens;
  square?: BadgeTokens;
}
export interface BadgeTokens extends BadgeCoreTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The icon color when hovering over the Badge.
   */
  iconColorHovered?: ColorValue;

  /**
   * The icon color when the Badge is being pressed.
   */
  iconColorPressed?: ColorValue;

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
  filledInverted?: BadgeTokens;

  /**
   * States that can be applied to a Badge
   */
  hovered?: BadgeTokens;
  focused?: BadgeTokens;
}

export interface BadgeCoreProps {
  /**
   * Badge shape: 'rounded' | 'circular' | 'square'
   * @defaultvalue rounded
   */
  shape?: BadgeShape;

  /** Sets style of Badge to a preset size style  */
  size?: BadgeSize;
}
export interface BadgeProps extends BadgeCoreProps {
  /**
   * A Badge can have its content and borders styled for greater emphasis or to be subtle.
   * filled -
   * outline -
   */
  appearance?: BadgeAppearance;

  /*
   * Source URL or name of the icon to show on the Badge.
   */
  icon?: IconSourcesType;

  /**
   * Icon can be placed before or after Badge's content.
   * @default before
   */
  iconPosition?: 'before' | 'after';

  /*
   * Text to show on the Badge.
   */
  text?: string;
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

import { ViewStyle, ColorValue, NativeScrollRectangle } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const badgeName = 'Badge';
export type BadgeSize = 'smallest' | 'smaller' | 'small' | 'medium' | 'large' | 'largest';
export type BadgeAppearance = 'filled' | 'outline' | 'tint' | 'ghost' | 'filledInverted';
export type BadgeShape = 'rounded' | 'circular' | 'square';

export interface BadgeTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * Set the bottom edge of the Badge
   */
  bottom?: NativeScrollRectangle['bottom'];

  /**
   * The height of the Badge.
   */
  height?: ViewStyle['height'];

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
   * Set the left edge of the Badge
   */
  left?: NativeScrollRectangle['left'];

  /**
   * Set the right edge of the Badge
   */
  right?: NativeScrollRectangle['right'];

  /**
   * Set the top edge of the Badge
   */
  top?: NativeScrollRectangle['top'];

  /**
   * The width of the Badge.
   */
  width?: ViewStyle['width'];

  /**
   * Additional states that can be applied to a Badge
   */
  filled?: BadgeTokens;
  outline?: BadgeTokens;
  tint?: BadgeTokens;
  ghost?: BadgeTokens;
  filledInverted?: BadgeTokens;

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

  /**
   * States that can be applied to a Badge
   */
  hovered?: BadgeTokens;
  focused?: BadgeTokens;
}

export interface BadgeProps {
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
   * Icon can be placed before or after Button's content.
   * @default before
   */
  iconPosition?: 'before' | 'after';

  /**
   * Badge shape: 'rounded' | 'circular' | 'square'
   * @defaultvalue rounded
   */
  shape?: BadgeShape;

  /** Sets style of Badge to a preset size style  */
  size?: BadgeSize;

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

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
  iconColor?: ColorValue;
  iconColorHovered?: ColorValue;
  iconColorPressed?: ColorValue;
  iconSize?: number;
  iconWeight?: number;
  height?: ViewStyle['height'];
  width?: ViewStyle['width'];
  top?: NativeScrollRectangle['top'];
  left?: NativeScrollRectangle['left'];
  bottom?: NativeScrollRectangle['bottom'];
  right?: NativeScrollRectangle['right'];

  /**
   * States that can be applied to a Badge
   */
  hovered?: BadgeTokens;
  focused?: BadgeTokens;

  /**
   * Additional states that can be applied to a Badge
   */
  filled?: BadgeTokens;
  outline?: BadgeTokens;
  tint?: BadgeTokens;
  ghost?: BadgeTokens;
  filledInverted?: BadgeTokens;

  smallest?: BadgeTokens;
  smaller?: BadgeTokens;
  small?: BadgeTokens;
  medium?: BadgeTokens;
  large?: BadgeTokens;
  largest?: BadgeTokens;

  rounded?: BadgeTokens;
  circular?: BadgeTokens;
  square?: BadgeTokens;

  DND?: BadgeTokens;
  busy?: BadgeTokens;
  unknown?: BadgeTokens;
  blocked?: BadgeTokens;
  OOF?: BadgeTokens;
  away?: BadgeTokens;
  available?: BadgeTokens;
  offline?: BadgeTokens;
}

export interface BadgeProps {
  text?: string;
  icon?: IconSourcesType;
  appearance?: BadgeAppearance;
  size?: BadgeSize;

  /**
   * @defaultvalue rounded
   */
  shape?: BadgeShape;

  /**
   * @default before
   */
  iconPosition?: 'before' | 'after';
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

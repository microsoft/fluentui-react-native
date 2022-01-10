import { ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const badgeName = 'Badge';
export type BadgeSize = 'smallest' | 'smaller' | 'small' | 'medium' | 'large' | 'largest';
export type BadgeAppearance = 'filled' | 'outline' | 'tint' | 'ghost' | 'filledInverted';
export type BadgeShape = 'rounded' | 'circular' | 'square';
export type Presence = 'DND' | 'busy' | 'unknown' | 'blocked' | 'OOF' | 'away' | 'available' | 'offline';

export interface BadgeTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
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
   * The height of the Badge.
   */
  height?: ViewStyle['height'];

  /**
   * The width of the Badge.
   */
  width?: ViewStyle['width'];

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
  /*
   * Text to show on the Badge.
   */
  text?: string;

  /*
   * Source URL or name of the icon to show on the Badge.
   */
  icon?: IconSourcesType;

  /**
   * A Badge can have its content and borders styled for greater emphasis or to be subtle.
   * filled -
   * outline -
   */
  appearance?: BadgeAppearance;

  /** Sets style of Badge to a preset size style  */
  size?: BadgeSize;

  /**
   * Badge shape: 'rounded' | 'circular' | 'square'
   * @defaultvalue rounded
   */
  shape?: BadgeShape;

  /**
   * Badge presence
   */
  presence?: Presence;

  /**
   * Icon can be placed before or after Button's content.
   * @default before
   */
  iconPosition?: 'before' | 'after';
}

export interface BadgeSlotProps {
  root: IViewWin32Props;
  icon: IconProps;
  text: TextProps;
}

export interface BadgeType {
  props: BadgeProps;
  tokens: BadgeTokens;
  slotProps: BadgeSlotProps;
}

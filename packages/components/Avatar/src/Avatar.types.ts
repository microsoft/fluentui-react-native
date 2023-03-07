import type { ImageProps, ViewProps, TextProps, ColorValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { PresenceBadgeProps, BadgeSize, PresenceBadgeStatus } from '@fluentui-react-native/badge';
import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { IBackgroundColorTokens, IForegroundColorTokens, IBorderTokens, FontTokens } from '@fluentui-react-native/tokens';
import type { SvgProps } from 'react-native-svg';

export const AvatarName = 'Avatar';
export const AvatarSizesForTokens = [
  'size16',
  'size20',
  'size24',
  'size28',
  'size32',
  'size36',
  'size40',
  'size48',
  'size56',
  'size64',
  'size72',
  'size96',
  'size120',
] as const;

export const AvatarSizes = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120] as const;

/**
 * Sets color of the avatar when there is no picture. Uses fluent color names
 */
export const AvatarColors = [
  'darkRed',
  'cranberry',
  'red',
  'pumpkin',
  'peach',
  'marigold',
  'gold',
  'brass',
  'brown',
  'forest',
  'seafoam',
  'darkGreen',
  'lightTeal',
  'teal',
  'steel',
  'blue',
  'royalBlue',
  'cornflower',
  'navy',
  'lavender',
  'purple',
  'grape',
  'lilac',
  'pink',
  'magenta',
  'plum',
  'beige',
  'mink',
  'platinum',
  'anchor',
  'burgundy',
  'hotPink',
  'orchid',
] as const;

export const ColorSchemes = ['neutral', 'brand', 'colorful', 'brandInverted', 'accent'] as const;
export type AvatarSize = (typeof AvatarSizes)[number];
export type AvatarNamedColor = (typeof AvatarColors)[number];
export type AvatarColorSchemes = (typeof ColorSchemes)[number];

export type AvatarShape = 'circular' | 'square';
export type AvatarActive = 'active' | 'inactive' | 'unset';
export type AvatarActiveAppearance = 'ring';

export type AvatarColor = AvatarColorSchemes | AvatarNamedColor | ColorValue;

export interface AvatarConfigurableProps {
  /**
   *   Optional activity indicator
   * * active: the avatar will be decorated according to activeAppearance
   * * inactive: the avatar will be reduced in size and partially transparent
   * * unset: normal display
   * @defaultvalue unset
   */
  active?: AvatarActive;

  /**
   * The color when displaying either an icon or initials.
   * * neutral (default): gray
   * * brand: color from the brand palette
   * * brandInverted: Inverted color from the brand palette. @platform android
   * * accent @platform android
   * * colorful: picks a color from a set of pre-defined colors, based on a hash of the name (or idForColor if provided)
   * * [AvatarNamedColor]: a specific color from the theme
   * @defaultvalue neutral
   */
  avatarColor?: AvatarColor;

  /**
   * Badge status: `doNotDisturb`, `busy`, `unknown`, `blocked`, `outOfOffice`, `away`, `available`, `offline`
   */
  badgeStatus?: PresenceBadgeStatus;

  initialsColor?: ColorValue;

  outOfOffice?: boolean;

  /**
   * Ring props
   */
  ringInnerGap?: number;
  ringBackgroundColor?: ColorValue;

  /**
   * Color for the Activity Ring in status "active"
   */
  ringColor?: ColorValue;

  /**
   * Size of activity ring in status "active"
   */
  ringThickness?: number;

  transparentRing?: boolean;

  /**
   * Size of the avatar in pixels.
   *
   * Size is restricted to a limited set of supported values recommended for most uses (see `AvatarSizeValue`) and
   * based on design guidelines for the Avatar control.
   * @defaultvalue 24
   */
  size?: AvatarSize;
}

export interface AvatarProps extends IViewProps, AvatarConfigurableProps {
  /**
   * The appearance when `active="active"`
   *
   * @defaultvalue ring
   */
  activeAppearance?: AvatarActiveAppearance;

  /**
   * Badge shows the avatar's presence status.
   * Badge can be shown only if `active` prop is undefined or unset
   */
  badge?: PresenceBadgeProps;

  /**
   * Icon to be displayed when the avatar doesn't have an image or initials.
   * @defaultvalue `PersonRegular` (the default icon's size depends on the Avatar's size)
   */
  icon?: IconSourcesType;

  /**
   * Specify a string to be used instead of the name, to determine which color to use when color="colorful".
   * Use this when a name is not available, but there is another unique identifier that can be used instead.
   */
  idForColor?: string;

  /**
   * (optional) Custom initials.
   *
   * It is usually not necessary to specify custom initials; by default they will be derived from the `name` prop,
   * using the `getInitials` function.
   *
   * The initials are displayed when there is no image (including while the image is loading).
   */
  initials?: string;

  /**
   * The name of the person or entity represented by this Avatar. This should always be provided if it is available.
   *
   * The name will be used to determine the initials displayed when there is no icon, as well as provided to
   * accessibility tools.
   */
  name?: string;

  /**
   * The avatar can have a circular or square shape.
   * @defaultvalue circular
   */
  shape?: AvatarShape;

  /**
   * The Avatar's image.
   */
  image?: ImageProps;

  /**
   * Shorthand for passing image URL instead of using `image` prop
   */
  imageUrl?: string;
}

export interface AvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps, IBorderTokens, FontTokens {
  /**
   * Avatar opacity which is changed depending on `active` prop.
   * Not applicable for - @platform android
   */
  avatarOpacity?: number;

  /**
   * The size of presence badge.
   */
  badgeSize?: BadgeSize;

  /**
   * The x position of presence badge.
   * This is used to override the default position of the badge picked from presenceBadge tokens.
   * 0 aligns the badge (including its margin) to the right edge of the avatar.
   */
  badgeX?: number;

  /**
   * The y position of presence badge.
   * This is used to override the default position of the badge picked from presenceBadge tokens.
   * 0 aligns the badge (including its margin) to the bottom edge of the avatar.
   */
  badgeY?: number;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * Avatar shapes:
   */
  circular?: AvatarTokens;
  square?: AvatarTokens;

  /**
   * Token for inactive value of `active` prop
   */
  inactive?: AvatarTokens;

  /**
   * Avatar sizes:
   */

  /** Only applicable for @platform android */
  size16?: AvatarTokens;

  size20?: AvatarTokens;
  size24?: AvatarTokens;

  /** Not applicable for @platform android */
  size28?: AvatarTokens;

  size32?: AvatarTokens;

  /** Not applicable for @platform android */
  size36?: AvatarTokens;

  size40?: AvatarTokens;

  /** Not applicable for @platform android */
  size48?: AvatarTokens;

  size56?: AvatarTokens;

  /** Not applicable for @platform android */
  size64?: AvatarTokens;

  size72?: AvatarTokens;

  /** Not applicable for @platform android */
  size96?: AvatarTokens;

  /** Not applicable for @platform android */
  size120?: AvatarTokens;

  /**
   * Avatar colors:
   */
  neutral?: AvatarTokens;
  brand?: AvatarTokens;
  brandInverted?: AvatarTokens;
  accent?: AvatarTokens;
  darkRed?: AvatarTokens;
  cranberry?: AvatarTokens;
  red?: AvatarTokens;
  pumpkin?: AvatarTokens;
  peach?: AvatarTokens;
  marigold?: AvatarTokens;
  gold?: AvatarTokens;
  brass?: AvatarTokens;
  brown?: AvatarTokens;
  forest?: AvatarTokens;
  seafoam?: AvatarTokens;
  darkGreen?: AvatarTokens;
  lightTeal?: AvatarTokens;
  teal?: AvatarTokens;
  steel?: AvatarTokens;
  blue?: AvatarTokens;
  royalBlue?: AvatarTokens;
  cornflower?: AvatarTokens;
  navy?: AvatarTokens;
  lavender?: AvatarTokens;
  purple?: AvatarTokens;
  grape?: AvatarTokens;
  lilac?: AvatarTokens;
  pink?: AvatarTokens;
  magenta?: AvatarTokens;
  plum?: AvatarTokens;
  beige?: AvatarTokens;
  mink?: AvatarTokens;
  platinum?: AvatarTokens;
  anchor?: AvatarTokens;
  burgundy?: AvatarTokens;
  hotPink?: AvatarTokens;
  orchid?: AvatarTokens;
}

export interface AvatarSlotProps {
  root: ViewProps;
  image: ImageProps;
  initials: TextProps;
  initialsBackground: ViewProps;
  icon: IconProps;
  fallbackIcon: SvgProps;
  ring: ViewProps;
  outerRing?: ViewProps; // Android Only.
  badge: PresenceBadgeProps;
}

export interface AvatarState {
  showRing: boolean;
  transparentRing: boolean;
  showBadge: boolean;
}

export interface AvatarInfo {
  props: AvatarProps;
  state: AvatarState;
}

export interface AvatarType {
  props: AvatarProps;
  slotProps: AvatarSlotProps;
  tokens: AvatarTokens;
  state: AvatarState;
}

export interface RingConfig {
  size: number;
  ringThickness: number;
  innerGap: number;
}

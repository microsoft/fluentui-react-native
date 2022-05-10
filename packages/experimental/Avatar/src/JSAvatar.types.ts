import type { IViewProps } from '@fluentui-react-native/adapters';
import { ImageProps, ViewProps, TextProps, ColorValue } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens, IBorderTokens, FontTokens } from '@fluentui-react-native/tokens';
import { BadgeProps, PresenceBadgeProps, BadgeSize } from '@fluentui-react-native/badge';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const JSAvatarName = 'Avatar';
export const AvatarSizesForTokens = [
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

export const AvatarSizes = [20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120] as const;

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
] as const;
export type AvatarSize = typeof AvatarSizes[number];
export type AvatarNamedColor = typeof AvatarColors[number];

export type AvatarShape = 'circular' | 'square';
export type AvatarActive = 'active' | 'inactive' | 'unset';
export type AvatarActiveAppearance = 'ring' | 'shadow' | 'glow' | 'ring-shadow' | 'ring-glow';
export type AvatarColor = 'neutral' | 'brand' | 'colorful' | AvatarNamedColor;
export type IconAlignment = 'start' | 'center' | 'end';

export interface RingConfig {
  accent?: boolean;
  transparent?: boolean;
  ringBackgroundColor?: ColorValue; // inner/outer rings
  ringThickness?: number;
  innerGap?: number;
}

export interface AvatarConfigurableProps {
  /**
   * The color when displaying either an icon or initials.
   * * neutral (default): gray
   * * brand: color from the brand palette
   * * colorful: picks a color from a set of pre-defined colors, based on a hash of the name (or idForColor if provided)
   * * [AvatarNamedColor]: a specific color from the theme
   *
   * @defaultvalue neutral
   */
  avatarColor?: AvatarColor;
  ring?: RingConfig;
}

export interface JSAvatarProps extends IViewProps, AvatarConfigurableProps {
  /**
   * Optional activity indicator
   * * active: the avatar will be decorated according to activeAppearance
   * * inactive: the avatar will be reduced in size and partially transparent
   * * unset: normal display
   *
   * @defaultvalue unset
   */
  active?: AvatarActive;

  /**
   * The appearance when `active="active"`
   *
   * @defaultvalue ring
   */
  activeAppearance?: AvatarActiveAppearance;
  badge?: PresenceBadgeProps;

  /**
   * Icon to be displayed when the avatar doesn't have an image or initials.
   *
   * @defaultvalue `PersonRegular` (the default icon's size depends on the Avatar's size)
   */
  icon?: IconSourcesType;

  /**
   * Specify a string to be used instead of the name, to determine which color to use when color="colorful".
   * Use this when a name is not available, but there is another unique identifier that can be used instead.
   */
  idForColor?: string | undefined;

  image?: ImageProps;

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
   * Size of the avatar in pixels.
   *
   * Size is restricted to a limited set of supported values recommended for most uses (see `AvatarSizeValue`) and
   * based on design guidelines for the Avatar control.
   *
   * @defaultvalue 24
   */
  size?: AvatarSize;

  /**
   * The avatar can have a circular or square shape.
   * @defaultvalue circular
   */
  shape?: AvatarShape;
  src?: string;
}

export interface JSAvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps, IBorderTokens, FontTokens {
  iconSize?: number;
  height?: number;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
  circular?: JSAvatarTokens;
  square?: JSAvatarTokens;
  inactive?: JSAvatarTokens;
  avatarOpacity?: number;
  size20?: JSAvatarTokens;
  size24?: JSAvatarTokens;
  size28?: JSAvatarTokens;
  size32?: JSAvatarTokens;
  size36?: JSAvatarTokens;
  size40?: JSAvatarTokens;
  size48?: JSAvatarTokens;
  size56?: JSAvatarTokens;
  size64?: JSAvatarTokens;
  size72?: JSAvatarTokens;
  size96?: JSAvatarTokens;
  size120?: JSAvatarTokens;
  width?: number;
  badgeSize?: BadgeSize;
  neutral?: JSAvatarTokens;
  brand?: JSAvatarTokens;
  darkRed?: JSAvatarTokens;
  cranberry?: JSAvatarTokens;
  red?: JSAvatarTokens;
  pumpkin?: JSAvatarTokens;
  peach?: JSAvatarTokens;
  marigold?: JSAvatarTokens;
  gold?: JSAvatarTokens;
  brass?: JSAvatarTokens;
  brown?: JSAvatarTokens;
  forest?: JSAvatarTokens;
  seafoam?: JSAvatarTokens;
  darkGreen?: JSAvatarTokens;
  lightTeal?: JSAvatarTokens;
  teal?: JSAvatarTokens;
  steel?: JSAvatarTokens;
  blue?: JSAvatarTokens;
  royalBlue?: JSAvatarTokens;
  cornflower?: JSAvatarTokens;
  navy?: JSAvatarTokens;
  lavender?: JSAvatarTokens;
  purple?: JSAvatarTokens;
  grape?: JSAvatarTokens;
  lilac?: JSAvatarTokens;
  pink?: JSAvatarTokens;
  magenta?: JSAvatarTokens;
  plum?: JSAvatarTokens;
  beige?: JSAvatarTokens;
  mink?: JSAvatarTokens;
  platinum?: JSAvatarTokens;
  anchor?: JSAvatarTokens;
}

export interface AvatarSlotProps {
  root: ViewProps;
  image: ImageProps;
  initials: TextProps;
  initialsBackground: ViewProps;
  icon: IconProps;
  ring: ViewProps;
  badge: BadgeProps;
}

export interface JSAvatarState {
  showRing: boolean;
  transparentRing: boolean;
  showBadge: boolean;
}

export interface AvatarInfo {
  props: JSAvatarProps;
  state: JSAvatarState;
}

export interface JSAvatarType {
  props: JSAvatarProps;
  slotProps: AvatarSlotProps;
  tokens: JSAvatarTokens;
  state: JSAvatarState;
}

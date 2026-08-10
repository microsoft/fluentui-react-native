import type * as React from 'react';
import type { ImageProps, ViewProps } from 'react-native';

export const avatarSizes = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 128] as const;

export const avatarNamedColors = [
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

export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarNamedColor = (typeof avatarNamedColors)[number];
export type AvatarColor = 'neutral' | 'brand' | 'colorful' | AvatarNamedColor;
export type AvatarShape = 'circular' | 'square';
export type AvatarActive = 'unset' | 'active' | 'inactive';
export type AvatarActiveAppearance = 'ring' | 'shadow' | 'ring-shadow';

export interface AvatarProps extends Omit<ViewProps, 'children'> {
  /**
   * Activity treatment for the avatar.
   * @default 'unset'
   */
  active?: AvatarActive;

  /**
   * Visual treatment used while active.
   * @default 'ring'
   */
  activeAppearance?: AvatarActiveAppearance;

  /**
   * Content rendered over the lower trailing edge of the avatar.
   */
  badge?: React.ReactNode;

  /**
   * Background and foreground color treatment.
   * @default 'neutral'
   */
  color?: AvatarColor;

  /**
   * Replaces `name` as the stable input for colorful color selection.
   */
  idForColor?: string;

  /**
   * Image props. The avatar falls back to initials or icon after an image error.
   */
  image?: ImageProps;

  /**
   * URL shorthand for an image.
   */
  imageUrl?: string;

  /**
   * Custom initials. By default initials are derived from `name`.
   */
  initials?: string;

  /**
   * Custom fallback content. Any React node is accepted.
   */
  icon?: React.ReactNode;

  /**
   * Accessible name and input for generated initials and colorful colors.
   */
  name?: string;

  /**
   * Avatar geometry.
   * @default 'circular'
   */
  shape?: AvatarShape;

  /**
   * Avatar diameter in device-independent pixels.
   * @default 32
   */
  size?: AvatarSize;
}

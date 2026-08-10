import type * as React from 'react';
import type { ViewProps } from 'react-native';

export const badgeSizes = ['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
export const badgeAppearances = ['filled', 'ghost', 'outline', 'tint'] as const;
export const badgeColors = ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'] as const;
export const badgeShapes = ['circular', 'rounded', 'square'] as const;

export type BadgeSize = (typeof badgeSizes)[number];
export type BadgeAppearance = (typeof badgeAppearances)[number];
export type BadgeColor = (typeof badgeColors)[number];
export type BadgeShape = (typeof badgeShapes)[number];
export type BadgeIconPosition = 'before' | 'after';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  /**
   * Visual emphasis.
   * @default 'filled'
   */
  appearance?: BadgeAppearance;

  /**
   * Semantic color treatment.
   * @default 'brand'
   */
  color?: BadgeColor;

  /**
   * Badge content.
   */
  children?: React.ReactNode;

  /**
   * Optional leading or trailing visual.
   */
  icon?: React.ReactNode;

  /**
   * Position of `icon` relative to `children`.
   * @default 'before'
   */
  iconPosition?: BadgeIconPosition;

  /**
   * Badge geometry.
   * @default 'circular'
   */
  shape?: BadgeShape;

  /**
   * Preset Web-compatible badge size.
   * @default 'medium'
   */
  size?: BadgeSize;
}

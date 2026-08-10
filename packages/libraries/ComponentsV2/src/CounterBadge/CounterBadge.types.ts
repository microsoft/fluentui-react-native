import type { BadgeProps, BadgeSize } from '../Badge/Badge.types';

export const counterBadgeAppearances = ['filled', 'ghost'] as const;
export const counterBadgeColors = ['brand', 'danger', 'important', 'informative'] as const;
export const counterBadgeShapes = ['circular', 'rounded'] as const;

export type CounterBadgeAppearance = (typeof counterBadgeAppearances)[number];
export type CounterBadgeColor = (typeof counterBadgeColors)[number];
export type CounterBadgeShape = (typeof counterBadgeShapes)[number];

export interface CounterBadgeProps extends Omit<BadgeProps, 'appearance' | 'color' | 'shape'> {
  /**
   * Counter emphasis.
   * @default 'filled'
   */
  appearance?: CounterBadgeAppearance;

  /**
   * Counter semantic color.
   * @default 'brand'
   */
  color?: CounterBadgeColor;

  /**
   * Numeric value used when `children` is not provided.
   * @default 0
   */
  count?: number;

  /**
   * Displays a six-pixel dot instead of count content.
   * @default false
   */
  dot?: boolean;

  /**
   * Largest count displayed before the `+` suffix.
   * @default 99
   */
  overflowCount?: number;

  /**
   * Counter geometry.
   * @default 'circular'
   */
  shape?: CounterBadgeShape;

  /**
   * Shows an automatically generated zero count.
   * @default false
   */
  showZero?: boolean;

  /**
   * Preset size. Dot mode always renders at six pixels.
   * @default 'medium'
   */
  size?: BadgeSize;
}

import type * as React from 'react';
import type { ViewProps } from 'react-native';

import type { AvatarProps, AvatarSize } from '../Avatar';

export type AvatarGroupLayout = 'spread' | 'stack' | 'pie';
export type AvatarGroupOverflowIndicatorAppearance = 'count' | 'icon';

export interface AvatarGroupPartition<T> {
  inlineItems: readonly T[];
  overflowItems: readonly T[];
}

export interface AvatarGroupProps extends Omit<ViewProps, 'children'> {
  /**
   * AvatarGroupItem children. An overflow indicator is generated when maxItems hides entries.
   */
  children: React.ReactNode;

  /**
   * Arrangement of the group.
   * @default 'spread'
   */
  layout?: AvatarGroupLayout;

  /**
   * Maximum number of inline items. Pie layout always caps this at three.
   */
  maxItems?: number;

  /**
   * Content used by an automatically generated icon overflow indicator.
   */
  overflowIcon?: React.ReactNode;

  /**
   * Generated overflow indicator form.
   * @default 'count'
   */
  overflowIndicatorAppearance?: AvatarGroupOverflowIndicatorAppearance;

  /**
   * Accessible description and native title for the generated overflow indicator.
   */
  overflowTooltip?: string;

  /**
   * Size inherited by AvatarGroupItem and AvatarGroupOverflowIndicator.
   * @default 32
   */
  size?: AvatarSize;
}

export interface AvatarGroupItemProps extends AvatarProps {
  /**
   * Accessible description and native title semantics without a browser hover popover.
   */
  tooltip?: string;
}

export interface AvatarGroupOverflowIndicatorProps extends Omit<ViewProps, 'children'> {
  /**
   * Number displayed by the count appearance.
   */
  count?: number;

  /**
   * Custom content displayed by the icon appearance.
   */
  icon?: React.ReactNode;

  /**
   * Invoked when the overflow indicator is pressed.
   */
  onPress?: () => void;

  /**
   * Indicator form.
   * @default 'count'
   */
  appearance?: AvatarGroupOverflowIndicatorAppearance;

  /**
   * Overrides the inherited group size.
   */
  size?: AvatarSize;

  /**
   * Accessible description and native title semantics.
   */
  tooltip?: string;
}

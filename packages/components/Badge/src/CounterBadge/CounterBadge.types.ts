import type { BadgeCoreProps, BadgeSlotProps } from '../';
import type { BadgeTokens, BadgeProps } from '../Badge.types';

export const counterBadgeName = 'CounterBadge';

export interface CounterBadgeProps extends Omit<BadgeCoreProps, 'appearance' | 'color'>, Omit<BadgeProps, 'shape'> {
  /**
   * A Badge can have different appearances that emphasize certain parts of it:
   *  - filled: The default appearance if one is not specified.
   *    The badge background is filled with color with a contrasting foreground text to match.
   *  - ghost: The badge background is transparent, with the foreground text taking color to emphasize it.
   * @default filled
   */
  appearance?: 'filled' | 'ghost';

  /**
   * Semantic colors for a counter badge
   * @default brand
   */
  color?: 'brand' | 'danger' | 'important' | 'informative';

  /**
   * Value displayed by the Badge
   * @default 0
   */
  count?: number;

  /**
   * If a dot should be displayed without the count
   * @default false
   */
  dot?: boolean;

  /**
   * If the text badge is intended to be used a discovery surface
   * (badge used in a list).
   * @default false, dot takes precendence if both are passed true.
   * @platform android
   */
  list?: boolean;

  /**
   * Max number to be displayed
   * @default 99
   */
  overflowCount?: number;

  /**
   * A Badge can be circular or rounded
   * @default circular
   */
  shape?: 'circular' | 'rounded';

  /**
   * If the badge should be shown when count is 0
   * @default false
   */
  showZero?: boolean;
}

export interface CounterBadgeTokens extends BadgeTokens {
  dot?: CounterBadgeTokens;
  list?: CounterBadgeTokens; // Android only
}

export type CounterBadgeSlotProps = BadgeSlotProps;

export interface CounterBadgeState {
  showBadge?: boolean;
}

export interface CounterBadgeInfo {
  props: CounterBadgeProps;
  state: CounterBadgeState;
}

export interface CounterBadgeType {
  props: CounterBadgeProps;
  slotProps: CounterBadgeSlotProps;
  tokens: CounterBadgeTokens;
}

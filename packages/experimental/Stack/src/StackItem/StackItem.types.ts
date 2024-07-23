import type { DimensionValue, ViewProps } from 'react-native';

export const stackItemName = 'Stack.StackItem';

/**
 * Stack item props
 */
export interface StackItemTokens {
  /**
   * Defines the margin to be applied to the StackItem relative to its container.
   */
  margin?: DimensionValue;

  /**
   * Defines the padding to be applied to the StackItem contents relative to its border.
   */
  padding?: DimensionValue;
  /**
   * Defines how much to grow the StackItem in proportion to its siblings.
   */
  grow?: boolean | number | 'inherit' | 'initial' | 'unset';

  /**
   * Defines at what ratio should the StackItem shrink to fit the available space.
   */
  shrink?: boolean | number | 'inherit' | 'initial' | 'unset';

  /**
   * Defines whether the StackItem should be prevented from shrinking.
   * This can be used to prevent a StackItem from shrinking when it is inside of a Stack that has shrinking items.
   * @defaultvalue false
   */
  disableShrink?: boolean;

  /**
   * Defines how to align the StackItem along the x-axis (for vertical Stacks) or the y-axis (for horizontal Stacks).
   */
  align?: 'auto' | 'stretch' | 'baseline' | 'start' | 'center' | 'end';

  /**
   * Defines whether the StackItem should take up 100% of the height of its parent.
   * @defaultvalue true
   */
  verticalFill?: boolean;

  /**
   * Defines order of the StackItem.
   * @defaultvalue 0
   */
  order?: number | string;
}

export type StackItemProps = StackItemTokens & ViewProps;
export type StackItemSlotProps = { root: ViewProps };

export interface StackItemType {
  props: StackItemProps;
  slotProps: StackItemSlotProps;
  tokens: StackItemTokens;
}

import { StackItemProps } from './StackItem/StackItem.types';
import { ViewStyle, ViewProps, ColorValue } from 'react-native';
import { IBorderTokens, FontTokens } from '@fluentui-react-native/tokens';

export const stackName = 'Stack';

/**
 * Defines a type made by the union of the different values that the align-items and justify-content flexbox
 * properties can take.
 */
export type Alignment = ViewStyle['justifyContent'] | 'start' | 'end';

export interface StackStatics {
  Item: React.FunctionComponent<StackItemProps>;
}

/**
 * Tokens from fabric.  Right now they are embedded in the props pending discussions of whether tokens: {} is
 * the right approach
 */
export interface StackTokenProps {
  /**
   * Defines the spacing between Stack children.
   * The property is specified as a value for 'row gap', followed optionally by a value for 'column gap'.
   * If 'column gap' is omitted, it's set to the same value as 'row gap'.
   */
  childrenGap?: number | string;

  /**
   * Defines a maximum height for the Stack.
   */
  maxHeight?: number | string;

  /**
   * Defines a maximum width for the Stack.
   */
  maxWidth?: number | string;

  /**
   * Defines the padding to be applied to the Stack contents relative to its border.
   */
  padding?: number | string;

  /**
   * Defines whether to render Stack children horizontally.
   * @defaultvalue false
   */
  horizontal?: boolean;

  /**
   * Defines whether to render Stack children in the opposite direction (bottom-to-top if it's a vertical Stack and
   * right-to-left if it's a horizontal Stack).
   * @defaultvalue false
   */
  reversed?: boolean;

  /**
   * Defines how to align Stack children horizontally (along the x-axis).
   */
  horizontalAlign?: Alignment;

  /**
   * Defines how to align Stack children vertically (along the y-axis).
   */
  verticalAlign?: Alignment;

  /**
   * Defines whether the Stack should take up 100% of the height of its parent.
   * This property is required to be set to true when using the `grow` flag on children in vertical oriented Stacks.
   * Stacks are rendered as block elements and grow horizontally to the container already.
   * @defaultvalue false
   */
  verticalFill?: boolean;

  /**
   * Defines whether Stack children should not shrink to fit the available space.
   * @defaultvalue false
   */
  disableShrink?: boolean;

  /**
   * Defines how much to grow the Stack in proportion to its siblings.
   */
  grow?: boolean | number;

  /**
   * Defines whether Stack children should wrap onto multiple rows or columns when they are about to overflow
   * the size of the Stack.
   * @defaultvalue false
   */
  wrap?: boolean;

  /**
   * Gap between items, multiplied by theme gap spacing.
   * Does not work while running Chakra for reasons specific to that engine (refer to https://github.com/microsoft/fluentui-react-native/issues/767)
   */
  gap?: number;
}

export interface StackTokens extends FontTokens, IBorderTokens, StackTokenProps {
  /**
   * background color for the stack
   */
  backgroundColor?: ColorValue;
}

/**
 * Base property definitions, these generally match fabric
 */
export interface StackProps extends StackTokenProps, ViewProps {}

export type StackSlotProps = {
  root: ViewProps;
  inner: ViewProps;
};

export interface StackType {
  props: StackProps;
  tokens: StackTokens;
  slotProps: StackSlotProps;
  statics: StackStatics;
}

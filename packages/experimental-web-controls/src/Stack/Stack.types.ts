import * as React from 'react';
import { ITextTokens, IBackgroundColorTokens, IBorderTokens } from '../tokens/index';
import { IComponentSettings } from '@uifabric/foundation-settings';
import { IComponent, IRenderData } from '@uifabric/foundation-compose';
import { IDivProps } from '../htmlTypes';
import { IStackItemProps } from './StackItem/StackItem.types';

/**
 * Defines a type made by the union of the different values that the align-items and justify-content flexbox
 * properties can take.
 * {@docCategory Stack}
 */
export type Alignment = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'baseline' | 'stretch';

/**
 * {@docCategory Stack}
 */
export interface IStackProps extends IStackTokens, IDivProps {
  /**
   * Defines how to render the Stack.
   */
  as?: React.ReactType<React.HTMLAttributes<HTMLElement>>;

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
  grow?: boolean | number | 'inherit' | 'initial' | 'unset';

  /**
   * Defines the spacing between Stack children.
   * The property is specified as a value for 'row gap', followed optionally by a value for 'column gap'.
   * If 'column gap' is omitted, it's set to the same value as 'row gap'.
   * @deprecated Use 'childrenGap' token instead.
   */
  gap?: number | string;

  /**
   * Defines the maximum width that the Stack can take.
   * @deprecated Use 'maxWidth' token instead.
   */
  maxWidth?: number | string;

  /**
   * Defines the maximum height that the Stack can take.
   * @deprecated Use 'maxHeight' token instead.
   */
  maxHeight?: number | string;

  /**
   * Defines the inner padding of the Stack.
   * @deprecated Use 'padding' token instead.
   */
  padding?: number | string;

  /**
   * Defines whether Stack children should wrap onto multiple rows or columns when they are about to overflow
   * the size of the Stack.
   * @defaultvalue false
   */
  wrap?: boolean;
}

/**
 * {@docCategory Stack}
 */
export interface IStackTokens extends ITextTokens, IBackgroundColorTokens, IBorderTokens {
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
}

export type IStackSettings = IComponentSettings<{
  root: IStackProps;
  inner: IDivProps;
}>;

export interface IStackStatics {
  Item: React.FunctionComponent<IStackItemProps>;
}

export type IStackComponent = IComponent<IStackProps, IStackSettings, IStackProps, any, IStackStatics>;
export type IStackRenderData = IRenderData<IStackProps, IStackSettings>;

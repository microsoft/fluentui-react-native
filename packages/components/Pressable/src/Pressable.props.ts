import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IViewProps, IViewStyle } from '@fluentui-react-native/adapters';
import type { IWithPressableOptions, IPressableState } from '@fluentui-react-native/interactive-hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

export type IPressableProps = IWithPressableOptions<IViewProps> & {
  children?: React.ReactNode;

  // Typescript will not allow an extension of the IView* interface
  // that allows style to take on a function value. This is not a problem
  // with children, presumably because function components are valid as children.
  // As such, a renderStyle prop that takes a function value is provided
  // instead, in conjunction with the base style prop (ViewStyle).
  // The style prop will only be used if a renderStyle is not provided.
  renderStyle?: IRenderStyle<IPressableState, IViewStyle>;
};

/**
 * Used by IRenderChild, it simply describes a function that takes
 * some generic state type T and returns a ReactNode
 */
export type IChildAsFunction<T> = (state: T) => React.ReactNode;

/**
 * An IRenderChild describes children as a function that take the current
 * state of the parent component. It is up to the parent to invoke the function
 * and make proper use of the more typical ReactNode object that is returned
 * This is an especially helpful construct when children of a Touchable require
 * knowledge of the interaction state of their parent to properly render themselves
 * (e.g. foreground color of a text child)
 */
export type IRenderChild<T> = IChildAsFunction<T> | React.ReactNode;

/**
 * An IRenderStyle describes style as a function that takes the current
 * state of the parent component. It is up to the parent to invoke the function
 * and make proper use of the more typical ViewStyle object that is returned
 * This is convenient for when styles need to be calculated depending on interaction states.
 */
export type IRenderStyle<T, S extends ViewStyle> = (state: T) => S;

export type IPressableType<TBase extends ObjectBase = IViewProps> = {
  props: IPressableProps;
  slotProps: {
    root: TBase;
  };
};

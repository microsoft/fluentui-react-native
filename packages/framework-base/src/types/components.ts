import type React from 'react';
import type { FurnJSX } from '../jsx-namespace.ts';
import { DistributiveOmit } from './helpers.ts';

/**
 * Base types for rendering components in a react application, extracted from react types. These types are conditional on react
 * version and handle the react 18/19 version differences.
 */
export type RenderResult = FurnJSX.Element;
export type RenderType = FurnJSX.ElementType;

/**
 * With react 18, our `children` type starts leaking everywhere and that causes conflicts on component declaration, specially in the `propTypes` property of
 * both `ComponentClass` and `FunctionComponent`.
 *
 * This type substitutes `React.ComponentType` only keeping the function signature, it omits `propTypes`, `displayName` and other properties that are not
 * required for the inference.
 *
 * @internal
 */
export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

/**
 * Get the props from a react component type
 */
export type PropsOf<TComponent> = TComponent extends React.JSXElementConstructor<infer P> ? P : never;

/**
 * Removes the 'ref' prop from the given Props type, leaving unions intact (such as the discriminated union created by
 * IntrinsicSlotProps). This allows IntrinsicSlotProps to be used with React.forwardRef.
 */
export type PropsWithoutRef<P> = 'ref' extends keyof P ? DistributiveOmit<P, 'ref'> : P;

/**
 * Removes the 'children' prop from the given Props type, leaving unions intact (such as the discriminated union created by
 * IntrinsicSlotProps). This allows IntrinsicSlotProps to be used with React.forwardRef.
 */
export type PropsWithoutChildren<P> = 'children' extends keyof P ? DistributiveOmit<P, 'children'> : P;

/**
 * type of the render function, not a FunctionComponent to help prevent hook usage
 */
export type FunctionComponentCore<TProps> = (props: TProps) => RenderResult;

/**
 * A function component that returns an element type. This allows for the empty call props usage for native
 * components, as well as handles the returns of React components.
 */
export type FunctionComponent<TProps> = FunctionComponentCore<TProps> & {
  displayName?: string;
};

export type FC<TProps> = FunctionComponent<TProps>;

export interface ExoticComponent<TProps> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: TProps): RenderResult;
  $$typeof: symbol;
}

export interface NamedExoticComponent<TProps> extends ExoticComponent<TProps> {
  displayName?: string;
}

/**
 * **THIS TYPE IS INTERNAL AND SHOULD NEVER BE EXPOSED**
 *
 * @internal
 */
export interface ComponentClass<TProps = {}, S = React.ComponentState> extends React.StaticLifecycle<TProps, S> {
  new (props: TProps): React.Component<TProps, S>;
}

/**
 * on types/react 18 ReactNode becomes a more strict type, which is not compatible with our current implementation. to avoid any issues we are creating our own ReactNode type which allows anything.
 *
 * This type should only be used for inference purposes, and should never be exposed.
 *
 * **THIS TYPE IS INTERNAL AND SHOULD NEVER BE EXPOSED**
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReactNode = React.ReactNode;

/**
 * This type is used to determine if the current version of React is 18+ or not.
 *
 * It checks if the `React.ReactNode` has `{}` it its type.
 * If it is, then it means that the current version of React is lower than 18.
 * If it is not, then it means that the current version of React is 18 or higher.
 * This is useful for ensuring compatibility with different versions of React.
 *
 * **THIS TYPE IS INTERNAL AND SHOULD NEVER BE EXPOSED**
 *
 * @internal
 */
export type ReactVersionDependent<Modern, Legacy> = {} extends React.ReactNode ? Legacy : Modern;

/**
 * Our own alias for `JSX.Element` type that is compatible with both React 17 and React 18+.
 * Use this type when annotating JSX markup in all our code in order to avoid issues between different React versions.
 *
 * Example usage:
 *
 * BAD:
 * ```tsx
 * const renderFoo = (state: FooState) = <div {...props}>Hello World</div>;
 * // infers
 * // R17:  declare const renderFoo: (state: FooState) => JSX.Element;
 * // R18+: declare const renderFoo: (state: FooState) => React.JSX.Element;
 * ```
 *
 * GOOD:
 * ```tsx
 * import type { JSXElement } from '@fluentui/react-utilities';
 * const renderFoo = (state: FooState): JSXElement = <div {...props}>Hello World</div>;
 * ```
 */
export type JSXElement = React.ReactElement<
  /* eslint-disable @typescript-eslint/no-explicit-any */
  any,
  any
  /* eslint-enable @typescript-eslint/no-explicit-any */
>;

/**
 * Type representing all valid JSX intrinsic element names (e.g., 'div', 'button', 'input').
 * It's derived from `React.ElementType` by excluding all custom component types (`React.ComponentType`), ensuring it only includes standard HTML and SVG elements.
 *
 * Use this type when you need to restrict a type to only valid intrinsic element names.
 *
 * @example
 * ```tsx
 * import * as React from 'react';
 * import type { JSXIntrinsicElementKeys } from '@fluentui/react-utilities';
 *
 * const createElement = (tag: JSXIntrinsicElementKeys) => React.createElement(tag, {});
 *
 * createElement('div'); // Valid
 * createElement('span'); // Valid
 * createElement('unknown'); // Error: Argument of type '"unknown"' is not assignable to parameter of type 'JSXIntrinsicElementKeys'.
 * ```
 *
 * This type helps ensure that only valid intrinsic elements are used in scenarios where custom components are not allowed.
 */
export type JSXIntrinsicElementKeys = Exclude<React.ElementType, React.ComponentType>;

/**
 * Our own alias for `JSX.IntrinsicElements` type that is compatible with both React 17 and React 18+.
 * Use this type to get the intrinsic elements from React types in order to avoid issues between different React versions.
 */
export type JSXIntrinsicElement<Element extends JSXIntrinsicElementKeys> = React.ComponentProps<Element>;

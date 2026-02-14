import type React from 'react';

/**
 * This file defines a custom JSX namespace that re-exports React's JSX types, but also allows us to add our own custom behavior to the JSX runtime.
 * The main reason we need this is to support our "direct component" pattern, which allows certain components to bypass React's createElement and
 * return their own React elements directly from the JSX runtime.
 *
 * Exporting this custom namespace is required to make intrinsic attributes like key and ref work correctly with our custom JSX functions. The normal
 * fallback behavior if not defined is to not allow any attributes on intrinsic elements, which breaks a lot of React functionality.
 *
 * The custom behavior is implemented in the jsx and jsxs functions, which first check if the type being rendered is a direct component and if so, call it directly.
 *
 * Thanks to the emotion library's jsx-namespace for providing a reference implementation of how to do this while handling both React 18 and React 19's
 * changes to the JSX types.
 */

type IsPreReact19 = 2 extends Parameters<React.FunctionComponent<any>>['length'] ? true : false;

/**
 * The following types are intrinsic types for React, but handled in a way that allows them to be correctly resolved in both
 * React 18 and React 19.
 *
 * React 18:
 * - JSX.Element, JSX.ElementClass, etc.
 * - no React.JSX namespace
 *
 * React 19:
 * - React.JSX.Element, React.JSX.ElementClass, etc.
 * - no global JSX namespace
 *
 * In both cases, we want to be able to reference these types in our custom JSX namespace, so we conditionally define them based on whether we're in
 * a pre-React 19 environment or not. The @ts-expect-error comments are used because both can't be valid at the same time so there will always be
 * an error.
 */

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXElement = true extends IsPreReact19 ? JSX.Element : React.JSX.Element;

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXElementClass = true extends IsPreReact19 ? JSX.ElementClass : React.JSX.ElementClass;

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXElementAttributesProperty = true extends IsPreReact19 ? JSX.ElementAttributesProperty : React.JSX.ElementAttributesProperty;

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXElementChildrenAttribute = true extends IsPreReact19 ? JSX.ElementChildrenAttribute : React.JSX.ElementChildrenAttribute;

// prettier-ignore
/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXLibraryManagedAttributes<C, P> = true extends IsPreReact19 ? JSX.LibraryManagedAttributes<C, P> : React.JSX.LibraryManagedAttributes<C, P>;

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXIntrinsicAttributes = true extends IsPreReact19 ? JSX.IntrinsicAttributes : React.JSX.IntrinsicAttributes;

// prettier-ignore
/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXIntrinsicClassAttributes<T> = true extends IsPreReact19 ? JSX.IntrinsicClassAttributes<T> : React.JSX.IntrinsicClassAttributes<T>;

/** @ts-expect-error references types for both react 18 and react 19, only one can be valid at a time */
type ReactJSXIntrinsicElements = true extends IsPreReact19 ? JSX.IntrinsicElements : React.JSX.IntrinsicElements;

// based on the code from @types/react@18.2.8
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3197efc097d522c4bf02b94e1a0766d007d6cdeb/types/react/index.d.ts#LL3204C13-L3204C13
type ReactJSXElementType = true extends IsPreReact19 ? string | React.JSXElementConstructor<any> : React.JSX.ElementType;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace FurnJSX {
  export type ElementType = ReactJSXElementType;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Element extends ReactJSXElement {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ElementClass extends ReactJSXElementClass {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ElementAttributesProperty extends ReactJSXElementAttributesProperty {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ElementChildrenAttribute extends ReactJSXElementChildrenAttribute {}
  export type LibraryManagedAttributes<C, P> = ReactJSXLibraryManagedAttributes<C, P>;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface IntrinsicAttributes extends ReactJSXIntrinsicAttributes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface IntrinsicClassAttributes<T> extends ReactJSXIntrinsicClassAttributes<T> {}
  export type IntrinsicElements = ReactJSXIntrinsicElements;
}

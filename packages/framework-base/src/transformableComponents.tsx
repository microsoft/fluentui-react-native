/** @jsx jsx */
import React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import type { PropsBase } from './types';

type CreateElementType = Parameters<typeof React.createElement>[0];
type CreateElementResult = ReturnType<typeof React.createElement>;

type ReactJSXType = Parameters<typeof ReactJSX.jsx>[0];
type ReactJSXResult = ReturnType<typeof ReactJSX.jsx>;

/** Props adjuster signature, not a hook */
export type TransformProps<TResult extends PropsBase> = (props: unknown) => TResult;

/**
 * A prop transform component is a function component which has all its functionality contained in a useTransform function that
 * transforms its input props before passing them to the base component.
 */
export type TransformableComponent<TProps> = React.FunctionComponent<TProps> & {
  transformProps: TransformProps<PropsBase>;
  Base: React.ComponentType<PropsBase>;
};

function getTransformedTargets(type: CreateElementType, props: unknown) {
  if (typeof type === 'function' && 'transformProps' in type && 'Base' in type) {
    const adjustedComponent = type as TransformableComponent<PropsBase>;
    if (adjustedComponent) {
      return {
        transformedType: adjustedComponent.Base,
        transformedProps: adjustedComponent.transformProps(props),
      };
    }
  }
  return {};
}

export function createTransformableComponent<TProps>(
  Base: React.ComponentType<PropsBase>,
  transformProps: TransformProps<PropsBase>,
): TransformableComponent<TProps> {
  return Object.assign(
    (props: TProps) => {
      const newProps = transformProps(props);
      return <Base {...newProps} />;
    },
    { transformProps, Base },
  );
}

export function useAsTransformableComponent<TProps>(
  Base: React.ComponentType<PropsBase>,
  transformProps: TransformProps<PropsBase>,
): TransformableComponent<TProps> {
  return React.useMemo(() => {
    return createTransformableComponent(Base, transformProps);
  }, [Base, transformProps]);
}

/**
 * This helper function can be used with the @jsx pragma to allow prop adjustment before creating elements.
 * If the element type is a transformable component, it will adjust the props and call itself recursively,
 * (potentially adjusting props again) until it reaches a non-transformable component, at which point it will
 * call React.createElement.
 */
export function withSlots(type: CreateElementType, props: unknown, ...children: React.ReactNode[]): CreateElementResult {
  const { transformedType, transformedProps } = getTransformedTargets(type, props);
  if (transformedType && transformedProps) {
    return withSlots(transformedType, transformedProps, ...children);
  }
  return React.createElement(type, props, ...children);
}

/**
 * Custom jsx function that applies prop adjustments before creating React elements.
 * This function is called by the JSX transform for each JSX element.
 */
export function jsx(type: ReactJSXType, props: unknown, key?: React.Key): ReactJSXResult {
  const { transformedType, transformedProps } = getTransformedTargets(type, props);
  if (transformedType && transformedProps) {
    return jsx(transformedType, transformedProps, key);
  }
  return ReactJSX.jsx(type, props, key);
}

/**
 * Custom jsxs function that applies prop adjustments before creating React elements with children.
 * This function is called by the JSX transform for JSX elements with multiple children.
 */
export function jsxs(type: ReactJSXType, props: unknown, key?: React.Key): ReactJSXResult {
  const { transformedType, transformedProps } = getTransformedTargets(type, props);
  if (transformedType && transformedProps) {
    return jsxs(transformedType, transformedProps, key);
  }
  return ReactJSX.jsxs(type, props, key);
}

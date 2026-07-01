import React from 'react';
import type { FunctionComponent, DirectComponent, LegacyDirectComponent, LegacyFunctionComponent } from '../types/render.types.ts';
import { SLOT_RENDER_TYPE_KEY } from '../const.ts';
import { splitPropsAndChildren } from '../utilities/typeUtils.ts';

/**
 * Helpers related to direct rendering patterns. Direct rendering allows a component to mark itself as safe to call
 * directly without going through the JSX runtime / createElement.
 * - the benefit of this is that it is lower overhead and doesn't create an entry in the react hierarchy
 * - the risk is that it is not safe to call hooks within these functions as they are not part of the React component lifecycle
 *
 * There are two patterns, a legacy pattern which has a call signature of (props, ...children) and a modern pattern which
 * has children as part of props. The issue with the legacy pattern is that if react was to call it directly without going
 * through the custom runtime children would be lost unless callers were checking both locations for some reason.
 */

/**
 * @param component functional component, usually a closure, to make into a direct component
 * @return the same component with the direct component flag set, return type is a pure function component
 */
export function directComponent<TProps>(component: FunctionComponent<TProps>): DirectComponent<TProps> {
  (component as DirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] = 'callable';
  return component as DirectComponent<TProps>;
}

/**
 * Checks if a component is a direct component.
 * @param component the component to check
 * @return true if the component is a direct component, false otherwise
 */
export function isDirectComponent<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is DirectComponent<TProps> {
  return (component as DirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'callable';
}

/**
 * Creates a legacy direct component from a legacy function component.
 * @param component the legacy function component to convert
 * @return the same component with the legacy direct component flag set
 * @deprecated Prefer the directComponent or slot patterns if writing new code.
 */
export function legacyDirectComponent<TProps>(component: LegacyFunctionComponent<TProps>): LegacyDirectComponent<TProps> {
  (component as LegacyDirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] = 'legacy';
  return component as LegacyDirectComponent<TProps>;
}

/**
 * Checks if a component is a legacy direct component
 * @param component the component to check
 * @return true if the component is a legacy direct component, false otherwise
 * @deprecated Prefer the directComponent or slot patterns if writing new code.
 */
export function isLegacyDirectComponent<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is LegacyDirectComponent<TProps> {
  return (component as LegacyDirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'legacy';
}

/**
 * Checks if a component is a direct component or a legacy direct component.
 * @param component the component to check
 * @return true if the component is a direct component or a legacy direct component, false otherwise
 * @internal
 */
export function isDirectComponentType<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is DirectComponent<TProps> | LegacyDirectComponent<TProps> {
  return isDirectComponent(component) || isLegacyDirectComponent(component);
}

/**
 * Renders a direct component or a legacy direct component.
 * @param component the component to render
 * @param props the props to pass to the component
 * @return the result of the component
 * @throws {Error} if the component is not a direct component or a legacy direct component, use isDirectComponentType to check
 * @internal
 */
export function renderDirectComponent<TProps>(
  component: DirectComponent<TProps> | LegacyDirectComponent<TProps>,
  props: TProps,
): ReturnType<typeof component> {
  if (isDirectComponent(component)) {
    return component(props);
  } else if (isLegacyDirectComponent(component)) {
    const [rest, childrenProps] = splitPropsAndChildren(props);
    if (childrenProps?.children && Array.isArray(childrenProps.children)) {
      return component(rest as TProps, ...childrenProps.children);
    } else {
      return component(rest as TProps, childrenProps?.children);
    }
  }
  throw new Error('Invalid direct component');
}

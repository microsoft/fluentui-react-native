import type { FunctionComponent, DirectComponent, LegacyDirectComponent, LegacyFunctionComponent } from '../types/render.types';
import { SLOT_RENDER_TYPE_KEY } from '../const';
import { splitPropsAndChildren } from '../utilities/typeUtils';
import { isDirectComponent, isLegacyDirectComponent } from './identify';
import { getChildrenAsArray } from '../utilities/children';

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
    // Pass the normalized children as a single argument rather than spreading. Legacy direct components forward their
    // `...children` rest parameter on to a render function that may accept children as a single parameter (e.g. the
    // deprecated framework's atomicRender). Spreading a multi-element children array here would forward multiple
    // arguments and silently drop every child after the first.
    return component(rest as TProps, ...getChildrenAsArray(childrenProps?.children));
  }
  throw new Error('Invalid direct component');
}

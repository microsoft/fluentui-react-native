import React from 'react';
import type { PhasedComponent, StagedComponent, LegacyFunctionComponent } from '../types/render.types';
import { renderForJsxRuntime } from './render';
import { SLOT_COMPONENT_KEY, SLOT_RENDER_TYPE_KEY } from '../const';
import type { PropsWithoutChildren } from '../types/props.types';
import { splitPropsAndChildren } from '../utilities/typeUtils';

/**
 * PHASED RENDERING (formerly called "staged" or "two-stage" rendering)
 *
 * The direct rendering pattern is useful for simple components, but it does not allow for hooks or complex logic. The phased render pattern allows
 * for a component to be rendered in two phases, allowing for hooks to be used in the first phase and then the second phase to be a simple render function that can
 * be called directly.
 *
 * In code that respects the pattern, the first phase will be called with props (though children will not be present) and will return a function that will be called
 * with additional props, this time with children present. This allows for the first phase to handle all the logic and hooks, while the second phase can be a simple render function
 * that can leverage direct rendering if supported.
 *
 * The component itself will be a FunctionComponent, but it will have an attached property that is the phased render function. This allows the component to be used in two
 * parts via the useSlot hook, or to be used directly in JSX/TSX as a normal component.
 */

/**
 * Take a phased render function and make a real component out of it, attaching the phased render function
 * so it can be split if used in that manner.
 * @param getInnerPhase - phased render function to wrap into a staged component
 */
export function phasedComponent<TProps>(getInnerPhase: (props: TProps) => React.ComponentType<TProps>): PhasedComponent<TProps> {
  return Object.assign(
    (props: TProps) => {
      // pull out children from props
      const { children, ...outerProps } = props as React.PropsWithChildren<TProps>;
      const Inner = getInnerPhase(outerProps as TProps);
      return renderForJsxRuntime(Inner, { children });
    },
    {
      [SLOT_COMPONENT_KEY]: getInnerPhase,
      [SLOT_RENDER_TYPE_KEY]: 'phased',
    },
  ) as PhasedComponent<TProps>;
}

/**
 * Determine if the component is a phased component
 */
export function isPhasedComponent<TProps>(component: unknown): component is PhasedComponent<TProps> {
  return component != null && (component as PhasedComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'phased';
}

/**
 * Take a staged render function and make a real component out of it
 *
 * @param staged - staged render function to wrap into a staged component
 * @param memo - optional flag to enable wrapping the created component in a React.memo HOC
 * @deprecated Use phasedComponent from phasedComponent.ts instead
 */
export function stagedComponent<TProps>(
  staged: (props: PropsWithoutChildren<Partial<TProps>>) => LegacyFunctionComponent<TProps>,
  memo?: boolean,
): StagedComponent<TProps> {
  // component wrapper that will render in the case that this component is not
  // used as a slot
  const component = (props: TProps) => {
    const [rest, childrenProp] = splitPropsAndChildren(props);
    const final = staged(rest);
    return Array.isArray(childrenProp?.children)
      ? final({} as TProps, ...childrenProp.children)
      : final({} as TProps, childrenProp?.children);
  };

  // memoize the component if requested and attach the required information to make this a staged component
  const result = memo ? React.memo(component) : component;
  return Object.assign(result, {
    [SLOT_COMPONENT_KEY]: staged,
    [SLOT_RENDER_TYPE_KEY]: 'phased-legacy',
  }) as StagedComponent<TProps>;
}

/**
 * Determine if the component is a staged component, the legacy phased pattern
 */
export function isStagedComponent<TProps>(component: unknown): component is StagedComponent<TProps> {
  return component != null && (component as StagedComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'phased-legacy';
}

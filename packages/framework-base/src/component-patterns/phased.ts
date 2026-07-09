import React from 'react';
import type { PhasedComponent, StagedComponent, StagedRender } from '../types/render.types';
import { renderForJsxRuntime } from './render';
import { legacyDirectComponent } from './direct';
import { isCustomRenderType } from './identify';
import { SLOT_COMPONENT_KEY, SLOT_RENDER_TYPE_KEY } from '../const';
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
 * Prepare the props for a staged component, splitting out the children and running the first stage to get the inner render function.
 * The inner render function may be a direct component (children carried via props) or an unmarked legacy function (children passed as trailing args).
 * Route both through renderDirectComponent so children are handled consistently, with only the children carried forward to the inner render.
 * @param staged - staged component to prepare props for
 * @param props - props to be passed to the staged component
 * @returns - a tuple containing the inner render function and the remaining props
 */
export function prepareStagedProps<TProps>(staged: StagedRender<TProps>, props: TProps): [React.ComponentType<TProps>, TProps] {
  // for staged components, the first stage will not expect any children, so split them out to pass on to the second stage
  const [rest, childrenProp] = splitPropsAndChildren(props);
  // run the first stage, which consumes the incoming props (minus children), this then returns the inner render function,
  // which may be a direct component (children carried via props) or an unmarked legacy function (children passed as trailing args)
  const inner = staged(rest as Partial<TProps>);
  // attach the type signifier if necessary as legacy consumers aren't reliable about this
  const final = isCustomRenderType(inner) ? inner : legacyDirectComponent(inner);
  // carry only children forward (force cast, if it has children we know it is in the TProps type)
  return [final, (childrenProp ?? {}) as TProps];
}

/**
 * Take a staged render function and make a real component out of it
 *
 * @param staged - staged render function to wrap into a staged component
 * @param memo - optional flag to enable wrapping the created component in a React.memo HOC
 * @deprecated Use phasedComponent from phasedComponent.ts instead
 */
export function stagedComponent<TProps>(staged: StagedRender<TProps>, memo?: boolean): StagedComponent<TProps> {
  // component wrapper that will render in the case that this component is not
  // used as a slot
  const component = (props: TProps) => {
    const [final, childrenProp] = prepareStagedProps(staged, props);
    return renderForJsxRuntime(final, childrenProp);
  };

  // memoize the component if requested and attach the required information to make this a staged component
  const result = memo ? React.memo(component) : component;
  return Object.assign(result, {
    [SLOT_COMPONENT_KEY]: staged,
    [SLOT_RENDER_TYPE_KEY]: 'phased-legacy',
  }) as StagedComponent<TProps>;
}

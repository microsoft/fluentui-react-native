import React from 'react';
import type { PhasedComponent, PhasedRender } from '../types/render';
import type { FunctionComponent } from '../types/components';
import { renderForJsxRuntime } from './render.ts';
import type { LegacyDirectComponent, ComposableFunction } from '../types/deprecated';
import { RENDER_PHASED, RENDER_CAN_COMPOSE, RENDER_STAGED } from '../types/constants.ts';

/**
 * Extract the phased render function from a component, if it has one.
 * Handles both the newer PhasedComponent pattern (_phasedRender) and the legacy
 * ComposableFunction pattern (_staged) for backward compatibility.
 *
 * @param component - The component to extract the phased render from
 * @returns The phased render function if present, undefined otherwise
 */
export function getPhasedRender<TProps>(component: React.ComponentType<TProps>): PhasedRender<TProps> | undefined {
  // only a function component can have a phased render
  if (typeof component === 'function') {
    // if this has a phased render function, return it
    if ((component as PhasedComponent<TProps>)[RENDER_PHASED]) {
      return (component as PhasedComponent<TProps>)[RENDER_PHASED];
    } else {
      // for backward compatibility check for staged render and return a wrapper that maps the signature
      const staged = (component as ComposableFunction<TProps>)[RENDER_STAGED];
      if (staged) {
        return (props: TProps) => {
          const { children, ...rest } = props as React.PropsWithChildren<TProps>;
          const inner = staged(rest as TProps, ...React.Children.toArray(children));
          // staged render functions were not consistently marking contents as composable, though they were treated
          // as such in useHook. To maintain compatibility we mark the returned function as composable here. This was
          // dangerous, but this shim is necessary for backward compatibility. The newer pattern is explicit about this.
          if (typeof inner === 'function' && !(inner as LegacyDirectComponent<TProps>)[RENDER_CAN_COMPOSE]) {
            return Object.assign(inner, { [RENDER_CAN_COMPOSE]: true });
          }
          return inner;
        };
      }
    }
  }
  return undefined;
}

/**
 * Take a phased render function and make a real component out of it, attaching the phased render function
 * so it can be split if used in that manner.
 * @param getInnerPhase - phased render function to wrap into a staged component
 */
export function phasedComponent<TProps>(getInnerPhase: PhasedRender<TProps>): FunctionComponent<TProps> {
  return Object.assign(
    (props: TProps) => {
      // pull out children from props
      const { children, ...outerProps } = props as React.PropsWithChildren<TProps>;
      const Inner = getInnerPhase(outerProps as TProps);
      return renderForJsxRuntime(Inner, { children });
    },
    { [RENDER_PHASED]: getInnerPhase },
  );
}

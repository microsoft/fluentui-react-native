import React from 'react';
import type { ComposableFunction, PhasedComponent, PhasedRender, FunctionComponent } from './render.types';
import { renderForJsxRuntime } from './render';

export function getPhasedRender<TProps>(component: React.ComponentType<TProps>): PhasedRender<TProps> | undefined {
  // only a function component can have a phased render
  if (typeof component !== 'function') {
    // if this has a phased render function, return it
    if ((component as PhasedComponent<TProps>)._phasedRender) {
      return (component as PhasedComponent<TProps>)._phasedRender;
    } else if ((component as ComposableFunction<TProps>)._staged) {
      // for backward compatibility check for staged render and return a wrapper that maps the signature
      const staged = (component as ComposableFunction<TProps>)._staged;
      return (props: TProps) => {
        const { children, ...rest } = props as React.PropsWithChildren<TProps>;
        return staged(rest as TProps, ...React.Children.toArray(children));
      };
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
    (props: React.PropsWithChildren<TProps>) => {
      // pull out children from props
      const { children, ...outerProps } = props;
      const Inner = getInnerPhase(outerProps as TProps);
      return renderForJsxRuntime(Inner, { children });
    },
    { _phasedRender: getInnerPhase },
  );
}

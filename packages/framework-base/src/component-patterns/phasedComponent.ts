import type React from 'react';
import { jsx, jsxs } from '../jsx-runtime';
import type { PhasedComponent, PhasedRender } from './render.types';

/**
 * Take a phased render function and make a real component out of it, attaching the phased render function
 * so it can be split if used in that manner.
 * @param getInnerPhase - phased render function to wrap into a staged component
 */
export function phasedComponent<TProps>(getInnerPhase: PhasedRender<TProps>): PhasedComponent<TProps> {
  return Object.assign(
    (props: React.PropsWithChildren<TProps>) => {
      // pull out children from props
      const { children, ...outerProps } = props;
      const Inner = getInnerPhase(outerProps as TProps);

      if (Array.isArray(children) && children.length > 1) {
        return jsxs(Inner, { children });
      } else {
        return jsx(Inner, { children });
      }
    },
    { _phasedRender: getInnerPhase },
  );
}

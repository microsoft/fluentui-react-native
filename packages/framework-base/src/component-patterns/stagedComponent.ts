import * as React from 'react';

import type { StagedRender, ComposableFunction } from './render.types';

function asArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/**
 * Take a staged render function and make a real component out of it
 *
 * @param staged - staged render function to wrap into a staged component
 * @param memo - optional flag to enable wrapping the created component in a React.memo HOC
 * @deprecated Use phasedComponent from phasedComponent.ts instead
 */
export function stagedComponent<TProps>(staged: StagedRender<TProps>, memo?: boolean): ComposableFunction<TProps> {
  const component = (props: React.PropsWithChildren<TProps>) => {
    const { children, ...rest } = props;
    return staged(rest as TProps)({} as React.PropsWithChildren<TProps>, asArray(children));
  };
  const stagedComponent = memo ? React.memo(component) : component;
  Object.assign(stagedComponent, { _staged: staged });
  return stagedComponent as ComposableFunction<TProps>;
}

/**
 * @jsxRuntime classic
 * @jsx withSlots
 */
import * as React from 'react';
import { withSlots } from './withSlots';

import type { StagedComponent, TwoStageRender, StagedRender, ComposableFunction } from './render.types';

function asArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/**
 * Take a staged render function and make a real component out of it
 *
 * @param staged - staged render function to wrap into a staged component
 * @param memo - optional flag to enable wrapping the created component in a React.memo HOC
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

/**
 * Take a two stage render function and make a real component out of it, attaching the staged render function
 * so it can be split if used in that manner.
 * @param staged - two stage render function to wrap into a staged component
 */
export function twoStageComponent<TProps>(staged: TwoStageRender<TProps>): StagedComponent<TProps> {
  return Object.assign(
    (props: React.PropsWithChildren<TProps>) => {
      const { children, ...outerProps } = props;
      const innerProps = { children } as React.PropsWithChildren<TProps>;
      const Inner = staged(outerProps as TProps);
      return <Inner {...innerProps} />;
    },
    { _twoStageRender: staged },
  );
}

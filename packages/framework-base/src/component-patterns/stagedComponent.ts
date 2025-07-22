import * as React from 'react';

/**
 * The final rendering of the props in a staged render. This is the function component signature that matches that of
 * React.createElement, children (if present) will be part of the variable args at the end.
 */
export type FinalRender<TProps> = (props: TProps, ...children: React.ReactNode[]) => JSX.Element | null;

/**
 * This is a pattern of rendering where a functional component can be executed in two stages rather than in a single pass.
 *
 * The pattern looks like:
 * (props) => {
 *   // handle props
 *   // call hooks, remember these can't be conditional
 *   // build styles and props to pass to child components
 *
 *   return (additionalProps, ...children) => {
 *     // return the actual element tree, this includes conditional branching or rendering
 *     // mixin additional props, props which require logic should be required in phase 1.
 *
 *     // NOTE: This is where children will show up
 *   };
 * }
 */

export type StagedRender<TProps> = (props: TProps, ...args: any[]) => FinalRender<TProps>;

/**
 * A composable function may have a two stage render function as an attached property. This allows the function to work
 * in all the standard react flows, but allows for pulling out the staged render when components understand it.
 */
export type ComposableFunction<TProps> = React.FunctionComponent<TProps> & { _staged?: StagedRender<TProps> };

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

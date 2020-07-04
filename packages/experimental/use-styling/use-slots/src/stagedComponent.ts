import * as React from 'react';

/**
 * This is a pattern of rendering where a functional component can be executed in two stages rather than in a single pass.
 *
 * The pattern looks like:
 * (props) => {
 *   // handle props
 *   // call hooks, remember these can't be conditional
 *   // build styles and props to pass to child components
 *
 *   return (additionalProps) => {
 *     // return the actual element tree, this includes conditional branching or rendering
 *     // mixin additional props, props which require logic should be required in phase 1.
 *   };
 * }
 */

export type StagedRender<TProps> = (props: TProps) => React.FunctionComponent<TProps>;

/**
 * A composable function may have a two stage render function as an attached property. This allows the function to work
 * in all the standard react flows, but allows for pulling out the staged render when components understand it.
 */
export type ComposableFunction<TProps> = React.FunctionComponent<TProps> & { _staged?: StagedRender<TProps> };

/**
 * Take a staged render function and make a real component out of it
 *
 * @param staged - staged render function to wrap into a staged component
 * @param memo - optional flag to enable wrapping the created component in a React.memo HOC
 */
export function stagedComponent<TProps>(staged: StagedRender<TProps>, memo?: boolean): ComposableFunction<TProps> {
  const component: ComposableFunction<TProps> = memo
    ? ((React.memo((props: TProps) => staged(props)({} as TProps)) as unknown) as ComposableFunction<TProps>)
    : (props: TProps) => staged(props)({} as TProps);
  component._staged = staged;
  return component;
}

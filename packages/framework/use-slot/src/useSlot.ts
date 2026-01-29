import * as React from 'react';

import { mergeProps, getPhasedRender, directComponent, renderForJsxRuntime, filterProps } from '@fluentui-react-native/framework-base';
import type { PropsFilter, FunctionComponent } from '@fluentui-react-native/framework-base';

export type ComponentType<TProps> = React.ComponentType<TProps>;

/**
 * useSlot hook function, allows authoring against pluggable slots as well as allowing components to be called as functions rather than
 * via createElement if they support it.
 *
 * @param component - any kind of component that can be rendered as part of the tree
 * @param initialProps - props, particularly the portion that includes styles, that should be passed to the component. These will be merged with what are specified in the JSX tree
 * @param filter - optional filter that will prune the props before forwarding to the component
 * @returns
 */
export function useSlot<TProps>(
  component: React.ComponentType<TProps>,
  initialProps: Partial<TProps>,
  filter?: PropsFilter,
): FunctionComponent<TProps> {
  // filter the initial props if a filter is specified
  const filteredProps = filterProps(initialProps, filter);

  // build the secondary processing function and the result holder, done via useMemo so the function identity stays the same. Rebuilding the closure every time would invalidate render
  return React.useMemo<FunctionComponent<TProps>>(() => {
    // extract the phased component function if that pattern is being used, will be undefined if it is a standard component
    const phasedRender = getPhasedRender<TProps>(component as React.ComponentType<TProps>);

    // do the first phase render with the initial props if we are using the staged pattern. This is typically getting
    // styles and tokens in place a single time for the component.
    const finalRender = phasedRender ? phasedRender(initialProps as TProps) : component;

    // now return a direct component function that can be used in JSX/TSX, this pattern is safe since we won't be using
    // hooks in this closure
    return directComponent<TProps>((innerProps: TProps) => {
      const finalInner = filterProps<TProps>(innerProps, filter);
      const finalProps = phasedRender ? finalInner : mergeProps(filteredProps, finalInner);
      return renderForJsxRuntime(finalRender as React.ComponentType<TProps>, finalProps);
    });
  }, [component, filter]);
}

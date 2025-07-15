import * as React from 'react';

import { mergeProps } from '@fluentui-react-native/framework-base/merge-props';

import type { SlotFn, NativeReactType } from './renderSlot';
import type { ComposableFunction, StagedRender } from './stagedComponent';

/**
 *
 * @param slot - component which may or may not be built using the staged pattern
 * @returns - the staged function or undefined
 */
function getStagedRender<TProps>(slot: NativeReactType | ComposableFunction<TProps>): StagedRender<TProps> | undefined {
  return (typeof slot === 'function' && (slot as ComposableFunction<TProps>)._staged) || undefined;
}

/**
 * useSlot hook function, allows authoring against pluggable slots as well as allowing components to be called as functions rather than
 * via createElement if they support it.
 *
 * @param component - any kind of component that can be rendered as part of the tree
 * @param props - props, particularly the portion that includes styles, that should be passed to the component. These will be merged with what are specified in the JSX tree
 * @param filter - optional filter that will prune the props before forwarding to the component
 * @returns
 */
export function useSlot<TProps>(
  component: NativeReactType | ComposableFunction<TProps>,
  props: TProps,
  filter?: (propName: string) => boolean,
): React.FunctionComponent<TProps> {
  // some types to make things cleaner
  type ResultHolder = { result: React.FunctionComponent<TProps> | TProps };
  type MemoTuple = [SlotFn<TProps>, ResultHolder];

  // extract the staged component function if that pattern is being used, will be undefined if it is a standard component
  const stagedComponent = getStagedRender<TProps>(component);

  // build the secondary processing function and the result holder, done via useMemo so the function identity stays the same. Rebuilding the closure every time would invalidate render
  const [fn, results] = React.useMemo<MemoTuple>(() => {
    // create a holder object so values can be passed to the closure
    const resultHolder = {} as ResultHolder;

    // create a function that is in the right format for rendering in JSX/TSX, this has children split out
    const slotFn: SlotFn<TProps> = (extraProps: TProps, ...children: React.ReactNode[]) => {
      const result = resultHolder.result;

      // result is either a function (if a staged component) or a set of props passed to useSlot (and sent here via resultHolder)
      let props: TProps = typeof result === 'function' ? extraProps : mergeProps(result, extraProps);

      // if we have a filter specified, run it creating a prop collection of { [key]: undefined } which will end up deleting the values via mergeStyles
      const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : undefined;
      if (propsToRemove?.length > 0) {
        props = mergeProps(props, Object.assign({}, ...propsToRemove.map((prop) => ({ [prop]: undefined }))) as unknown as TProps);
      }

      // now if result was a function then call it directly, if not go through the standard React.createElement process
      return typeof result === 'function'
        ? (result as React.FunctionComponent)(props, ...children)
        : React.createElement(component, props, ...children);
    };
    // mark the slotFn so that withSlots knows to handle it differently
    slotFn._canCompose = true;
    return [slotFn, resultHolder];
  }, [component, filter]);

  // if it is a staged component executre the first part with the props, otherwise just remember the props
  results.result = stagedComponent ? stagedComponent(props) : props;

  // return the function
  return fn;
}

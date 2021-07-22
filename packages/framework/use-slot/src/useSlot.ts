import * as React from 'react';
import { SlotFn, NativeReactType } from './renderSlot';
import { mergeProps } from '@fluentui-react-native/merge-props';
import { ComposableFunction, StagedRender } from './stagedComponent';

/**
 *
 * @param slot - component which may or may not be built using the staged pattern
 * @returns - the staged function or undefined
 */
function getStagedRender<TProps>(slot: NativeReactType | ComposableFunction<TProps>): StagedRender<TProps> | undefined {
  return (typeof slot === 'function' && (slot as ComposableFunction<TProps>)._staged) || undefined;
}

/**
 * useSlot hook function
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

  // build the secondary processing function and the result holder
  const [fn, results] = React.useMemo<MemoTuple>(() => {
    const resultHolder = {} as ResultHolder;
    const slotFn: SlotFn<TProps> = (extraProps: TProps, ...children: React.ReactNode[]) => {
      const result = resultHolder.result;
      let props: TProps = typeof result === 'function' ? extraProps : mergeProps(result, extraProps);
      const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : undefined;
      if (propsToRemove?.length > 0) {
        props = mergeProps(props, (Object.assign({}, ...propsToRemove.map((prop) => ({ [prop]: undefined }))) as unknown) as TProps);
      }
      return typeof result === 'function' ? (result as Function)(props, ...children) : React.createElement(component, props, ...children);
    };
    slotFn._canCompose = true;
    return [slotFn, resultHolder];
  }, [component, filter]);

  // if it is a staged component
  results.result = stagedComponent ? stagedComponent(props) : props;

  // return the function
  return fn;
}

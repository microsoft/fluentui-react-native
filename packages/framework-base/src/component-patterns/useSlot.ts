import * as React from 'react';

import { mergeProps, getPhasedRender, directComponent, renderForJsxRuntime, filterProps } from '@fluentui-react-native/framework-base';
import type { PropsFilter, FunctionComponent, SlotComponent } from '@fluentui-react-native/framework-base';
import type { CreateSlotOptions } from './slot.ts';
import type { PropsWithoutChildren } from '../types/props.types.ts';

export type ComponentType<TProps> = React.ComponentType<TProps>;

type SlotData<TProps> = {
  innerComponent: React.ComponentType<TProps>;
  propsToMerge?: TProps;
};

/**
 * useSlot hook function, allows authoring against pluggable slots as well as allowing components to be called as functions rather than
 * via createElement if they support it.
 *
 * @param component - any kind of component that can be rendered as part of the tree
 * @param hookProps - props, particularly the portion that includes styles, that should be passed to the component. These will be merged with what are specified in the JSX tree
 * @param filter - optional filter that will prune the props before forwarding to the component
 * @returns
 */
export function useSlot<TProps>(
  component: React.ComponentType<TProps>,
  hookProps?: Partial<TProps>,
  filter?: PropsFilter,
): FunctionComponent<TProps> {
  // create this once for this hook instance to hold slot data between phases
  const slotData = React.useMemo(() => {
    return {} as SlotData<TProps>;
  }, []);

  // see if this component is a phased render component
  const phasedRender = getPhasedRender<TProps>(component);
  if (phasedRender) {
    // if it is, run the first phase now with the hook props
    slotData.innerComponent = phasedRender(hookProps as TProps);
    slotData.propsToMerge = undefined;
  } else {
    // otherwise pass the hook props directly to the component
    slotData.innerComponent = component;
    slotData.propsToMerge = hookProps as TProps;
  }

  // build the secondary processing function and the result holder, done via useMemo so the function identity stays the same. Rebuilding the closure every time would invalidate render
  return React.useMemo<FunctionComponent<TProps>>(
    () =>
      directComponent<TProps>((innerProps: TProps) => {
        const { propsToMerge, innerComponent } = slotData;
        if (propsToMerge) {
          // merge in props from phase one if they haven't been captured in the phased render
          innerProps = mergeProps(propsToMerge, innerProps);
        }
        if (filter) {
          // filter the final props if a filter is specified
          innerProps = filterProps<TProps>(innerProps, filter);
        }
        // now render the component with the final props
        return renderForJsxRuntime(innerComponent, innerProps);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [component, filter, slotData],
  );
}

/**
 * The core useSlot implementation, while the return result will always be a SlotComponent, the implementation will fork
 * based on whether the component implements special rendering patterns.
 *
 * - component: Standard component (View, Text, function, class, etc.)
 *      This will create a slot, with the options and initial props configured, with the type as the base type.
 *      On render, any props added via jsx will be merged with the initial props, and our internal jsx runtime will render it
 *      directly. In essence if this slot is of type View that is what will appear in the render tree.
 *
 * - component: Direct component (created via one of our internal patterns)
 *      This will do all the work mentioned above, but when rendered via our internal runtime, it will call the function
 *      directly. E.g.: if component is a custom direct component called MyWrapper that itself contains a View, MyWrapper will
 *      be omitted from the render tree and only the View will be rendered.
 *
 * - component: Phased/Staged component
 *      In this case, the component implements a phased render pattern and since this function is itself a hook, we can deterministically call the
 *      inner hook component to get to the inner element. This effectively extends the direct component patterns to work with hooks as
 *      well. Allowing things like picking up context for theming without having to create unnecessary wrapper layers.
 *
 */
export function useSlotComponent<TProps>(
  component: React.ComponentType<TProps>,
  hookProps?: Partial<PropsWithoutChildren<TProps>>,
  options?: CreateSlotOptions<TProps>,
): SlotComponent<TProps> {
  // the
}

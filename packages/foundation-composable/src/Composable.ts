import * as React from 'react';
import { IComposable, IPropFilter, INativeSlotType, IWithComposable, IRenderData, ISlots } from './Composable.types';
import { useCompoundPrepare } from './Composable.slots';
import { renderSlot } from './slots';
import { ISlotProps } from '@uifabric/foundation-settings';

// just a generic object with children specified as props
type IWithChildren<T> = T & { children?: React.ReactNode[] };

/**
 * Helper to create a composable implementation of a simple atomic component
 *
 * @param target - slot type to create an atomic component from
 * @param usePrepareProps - prop processing implementation.
 * @param filter - optional filter.  If set it allows stripping properties before they are passed to target
 */
export function atomic<TProps extends object, TState = object>(
  target: INativeSlotType,
  usePrepareProps: IComposable<TProps, ISlotProps<TProps>, TState>['usePrepareProps'],
  filter?: IPropFilter
): React.FunctionComponent<TProps> {
  return composable<TProps, ISlotProps<TProps>, TState>({
    usePrepareProps,
    slots: { root: { slotType: target, filter } },
    render: (Slots: ISlots<ISlotProps<TProps>>, _renderData: IRenderData<ISlotProps<TProps>, TState>, ...children: React.ReactNode[]) => {
      return renderSlot(Slots.root, undefined, ...children);
    }
  });
}

/**
 * Create a component that can be composed into other objects to remove extra levels from the tree
 *
 * @param options - composable options which define the behavior of the component
 */
export function composable<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object>(
  options: IComposable<TProps, TSlotProps, TState>
): React.FunctionComponent<TProps> {
  // create the functional component
  const render = (userProps: TProps) => {
    // split out children, they will be excluded from the prop preparation phase
    const { children, ...props } = userProps as IWithChildren<TProps>;

    // prepare the props, all the way down the tree, also build the slots
    const { renderData, Slots } = useCompoundPrepare<TProps, TSlotProps, TState>(props as TProps, options);

    // now do the render, adding the children back in
    return options.render(Slots, renderData, ...children);
  };

  // set the options onto the new functional component and return it
  (render as IWithComposable<React.FunctionComponent<TProps>>).__composable = (options as unknown) as IComposable<object>;
  return render;
}

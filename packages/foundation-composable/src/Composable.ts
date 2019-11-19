import * as React from 'react';
import {
  IComposable,
  IPropFilter,
  INativeSlotType,
  IWithComposable,
  IRenderData,
  ISlots,
  IComposableDefinition,
  IExtractProps,
  IExtractSlotProps,
  IExtractState,
  IDefineUseStyling,
  IComposableType
} from './Composable.types';
import { useCompoundPrepare } from './Composable.slots';
import { renderSlot } from './slots';
import { ISlotProps, mergeSettings } from '@uifabricshared/foundation-settings';

// just a generic object with children specified as props
type IWithChildren<T> = T & { children?: React.ReactNode[] };

function _validateComposable<TProps, TSlotProps, TState>(options: IComposableDefinition<TProps, TSlotProps, TState>): void {
  const numSlots = (options.slots && Object.getOwnPropertyNames(options.slots).length) || 0;
  if (!numSlots) {
    throw 'A composable component must have at least one slot specified';
  } else if (numSlots > 1) {
    if (!options.render) {
      throw 'A composable component with multiple slots cannot use the default render implementation';
    } else if (!options.usePrepareProps) {
      throw 'A composable component with multiple slots cannot use the default usePrepareProps implementation';
    }
  }
}

export function atomicRender<TProps extends object, TState = object>(
  Slots: ISlots<ISlotProps<TProps>>,
  _renderData: IRenderData<ISlotProps<TProps>, TState>,
  ...children: React.ReactNode[]
): JSX.Element | null {
  return renderSlot(Slots.root, undefined, ...children);
}

export function atomicUsePrepareProps<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object>(
  props: TProps,
  useStyling: IDefineUseStyling<TProps, TSlotProps>
): IRenderData<TSlotProps, TState> {
  const slotProps = mergeSettings<TSlotProps>(useStyling(props), { root: props });
  return { slotProps };
}

/**
 * Create a component that can be composed into other objects to remove extra levels from the tree
 *
 * @param options - composable options which define the behavior of the component
 */
export function composable<TType>(
  options: IComposableDefinition<IExtractProps<TType>, IExtractSlotProps<TType>, IExtractState<TType>>
): IWithComposable<
  React.FunctionComponent<IExtractProps<TType>>,
  IComposable<IExtractProps<TType>, IExtractSlotProps<TType>, IExtractState<TType>>
> {
  // type aliases
  type IProps = IExtractProps<TType>;
  type IThisSlotProps = IExtractSlotProps<TType>;
  type IState = IExtractState<TType>;

  // create the functional component
  if (!options.useStyling) {
    options.useStyling = () => {
      return {} as IThisSlotProps;
    };
  }
  // ensure we are correctly configured
  _validateComposable(options);

  // use atomic handlers for usePrepareProps / render if necessary
  options.render = options.render || atomicRender;
  options.usePrepareProps = options.usePrepareProps || atomicUsePrepareProps;

  // create the actual implementation
  const render = (userProps: IProps) => {
    // split out children, they will be excluded from the prop preparation phase
    const { children, ...props } = userProps as IWithChildren<IProps>;

    // prepare the props, all the way down the tree, also build the slots
    const { renderData, Slots } = useCompoundPrepare<IProps, IThisSlotProps, IState>(
      props as IProps,
      options as IComposable<IProps, IThisSlotProps, IState>
    );

    // now do the render, adding the children back in
    return options.render(Slots, renderData, ...children);
  };
  render.displayName = options.displayName;

  // set the options onto the new functional component and return it
  type IReturnType = IWithComposable<React.FunctionComponent<IProps>, IComposable<IProps, IThisSlotProps, IState>>;
  (render as IReturnType).__composable = options as IComposable<IProps, IThisSlotProps, IState>;
  return render as IReturnType;
}

/**
 * Helper to create a composable implementation of a simple atomic component
 *
 * @param target - slot type to create an atomic component from
 * @param usePrepareProps - prop processing implementation.
 * @param filter - optional filter.  If set it allows stripping properties before they are passed to target
 */
export function atomic<TProps extends object, TState extends object = object>(
  target: INativeSlotType,
  usePrepareProps: IComposable<TProps, ISlotProps<TProps>, TState>['usePrepareProps'],
  filter?: IPropFilter
): React.FunctionComponent<TProps> {
  return composable<IComposableType<TProps, ISlotProps<TProps>, TState>>({
    usePrepareProps,
    slots: { root: { slotType: target, filter } },
    render: atomicRender
  });
}

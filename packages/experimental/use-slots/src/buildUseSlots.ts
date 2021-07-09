import * as React from 'react';
import { SlotFn, NativeReactType } from './renderSlot';
import { mergeProps } from '@fluentui-react-native/merge-props';
import { ComposableFunction, StagedRender } from './stagedComponent';

// type AsObject<T> = T extends object ? T : never

export type Slots<TSlotProps> = { [K in keyof TSlotProps]: SlotFn<TSlotProps[K]> };

export type UseSlotOptions<TSlotProps> = {
  slots: { [K in keyof TSlotProps]: NativeReactType | ComposableFunction<TSlotProps[K]> };
  filters?: { [K in keyof TSlotProps]?: (propName: string) => boolean };
  useStyling?: TSlotProps | GetSlotProps<TSlotProps>;
};

export type GetSlotProps<TSlotProps> = (...args: any[]) => TSlotProps;

export type UseSlotsBase<TSlotProps> = (...args: any[]) => Slots<TSlotProps>;

type CachedState<TSlotProps> = {
  /**
   * closures for each slot, created once and cached in the state
   */
  slots: Slots<TSlotProps>;

  /**
   * results of pre-render phase, either props to pass to render, or a render function returned from phase one
   */
  results: { [K in keyof TSlotProps]?: React.FunctionComponent<TSlotProps[K]> | TSlotProps[K] };
};

function internalRender<TProps>(
  slot: NativeReactType | ComposableFunction<TProps>,
  result: React.FunctionComponent<TProps> | TProps,
  extraProps: TProps,
  filter: (propsName: string) => boolean,
  children: React.ReactNode[],
): JSX.Element | null {
  let props: TProps = typeof result === 'function' ? extraProps : mergeProps(result, extraProps);
  const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : undefined;
  if (propsToRemove?.length > 0) {
    props = mergeProps(props, (Object.assign({}, ...propsToRemove.map((prop) => ({ [prop]: undefined }))) as unknown) as TProps);
  }
  return typeof result === 'function' ? (result as Function)(props, ...children) : React.createElement(slot, props, ...children);
}

function getStagedRender<TProps>(slot: NativeReactType | ComposableFunction<TProps>): StagedRender<TProps> | undefined {
  return (typeof slot === 'function' && (slot as ComposableFunction<TProps>)._staged) || undefined;
}

function buildSlotFunctions<TSlotProps>(
  slots: UseSlotOptions<TSlotProps>['slots'],
  filters?: UseSlotOptions<TSlotProps>['filters'],
): CachedState<TSlotProps> {
  const info: CachedState<TSlotProps> = { slots: {}, results: {} } as CachedState<TSlotProps>;
  Object.keys(slots).forEach((slot) => {
    info.slots[slot] = (props: TSlotProps[keyof TSlotProps], ...children: React.ReactNode[]) => {
      return internalRender<TSlotProps[keyof TSlotProps]>(
        slots[slot],
        info.results[slot],
        props,
        (filters && filters[slot]) || undefined,
        children,
      );
    };
    info.slots[slot]._canCompose = true;
  });
  return info as CachedState<TSlotProps>;
}

export function buildUseSlots<TSlotProps>(options: UseSlotOptions<TSlotProps>): UseSlotsBase<TSlotProps> {
  const { slots, filters, useStyling } = options;
  return (...args: any[]) => {
    // build up a set of slots closures and store them in props
    const state = React.useMemo(() => buildSlotFunctions<TSlotProps>(slots, filters), []);

    // get the baseline slot props to render with the slots
    const slotProps: TSlotProps = typeof useStyling === 'function' ? (useStyling as Function)(...args) : ((useStyling || {}) as TSlotProps);

    // for each slot go through and either cache the slot props or call part one render if it is staged
    Object.keys(slots).forEach((slotName) => {
      const props = slotProps[slotName];
      const staged = getStagedRender(slots[slotName]);
      state.results[slotName] = staged ? staged(props) : props;
    });

    // return the prebuilt closures, these will have internal references to state.results
    return state.slots;
  };
}

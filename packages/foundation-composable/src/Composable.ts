import * as React from 'react';
import {
  ISlotTypes,
  IComposable,
  IProcessResult,
  IGenericProps,
  IResolvedSlot,
  IResolvedSlots,
  IPropFilter,
  ISlotWithFilter,
  ISlotType,
  INativeSlotType,
  IWithComposable
} from './Composable.types';

/**
 * Process a component tree and return a resolved slot for it.  This should be used as the root call for processing
 * such that the recursion handles automatically
 *
 * @param composable - component to process the hierarchy for
 * @param props - input props to pass into the component hierarchy
 */
export function useProcessComposableTree(composable: IComposable, props: IGenericProps, theme: object): IResolvedSlot {
  const info: IProcessResult = composable.useProcessProps(props, theme);
  return {
    ...info,
    slots: useSlotProcessing(composable, info, theme),
    composable: composable
  };
}

/**
 * Process the slots on a composable, passing in props targeted at each entry and then creating the resolved slot collection
 * that is ready to use in a render function
 *
 * @param composable - composable component to process the slots for
 * @param info - slot info object which will be combined with resolved props on return
 * @param slotProps - props to pass into each slot
 */
export function useSlotProcessing(composable: IComposable, info: IProcessResult, theme: object): IResolvedSlots | undefined {
  const slotProps = info.slotProps || {};
  const componentSlots = composable.slots;
  if (componentSlots) {
    const slotResults = {};
    for (const key in componentSlots) {
      if (componentSlots[key]) {
        slotResults[key] = useProcessComposableTree(componentSlots[key], slotProps[key] || {}, theme);
      }
    }
    return slotResults;
  }
  return undefined;
}

/**
 * Render a slot according to the values stored in the slot info object
 *
 * @param slot - slot to perform standard rendering for
 * @param props - props for that slot, same pattern as for React.createElement
 * @param children - standard children values, as appropriate to pass to React.createElement
 */
export function renderSlot(slot: IResolvedSlot, ...children: React.ReactNode[]): JSX.Element | null {
  return slot.composable ? slot.composable.render(slot, ...children) : null;
}

/**
 * Process function for standard components
 *
 * @param props - props to put into the right format for return
 * @param _theme - theme, unused for this purpose
 * @param filter - optional filter function
 */
const _stockProcessor = (props: IGenericProps, _theme: object, filter?: IPropFilter) => {
  return {
    props: filter ? filter(props) : props
  };
};

/**
 * Take a non-composable component type or function and wrap it as a composable component
 *
 * @param component - type of component to wrap, either a standard react type or a function that takes props and children
 */
export function wrapStockComponent(component: INativeSlotType, filter?: IPropFilter): IComposable {
  return {
    useProcessProps: filter
      ? (props: IGenericProps, theme: object) => {
          return _stockProcessor(props, theme, filter);
        }
      : _stockProcessor,
    render: (slotInfo: IProcessResult, ...children: React.ReactNode[]) => {
      return React.createElement(component, slotInfo.props, ...children);
    }
  };
}

/**
 * turn a set of slot types into a set of IComposable interfaces
 *
 * @param slots - set of slot types to either wrap in a stock component or embed directly
 */
export function wrapSlots(slots: ISlotTypes): { [key: string]: IComposable } {
  const result = {};
  for (const key in slots) {
    if (slots[key]) {
      const slot = slots[key];
      const isObject = (slot as ISlotWithFilter).slotType;
      const slotType: ISlotType | undefined = isObject ? (slot as ISlotWithFilter).slotType : (slot as ISlotType);
      const filter = isObject ? (slot as ISlotWithFilter).filter : undefined;
      if (slot) {
        if (typeof slotType !== 'string' && (slotType as IWithComposable).__composable) {
          result[key] = (slotType as IWithComposable).__composable;
        } else {
          result[key] = wrapStockComponent(slotType as INativeSlotType, filter);
        }
      }
    }
  }
  return result;
}

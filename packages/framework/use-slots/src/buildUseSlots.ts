import type { ComposableFunction, SlotFn, NativeReactType } from '@fluentui-react-native/use-slot';
import { useSlot } from '@fluentui-react-native/use-slot';

// type AsObject<T> = T extends object ? T : never

/**
 * Signature for the use styling hook
 */
type UseStyling<TSlotProps> = (...props: unknown[]) => TSlotProps;

export type Slots<TSlotProps> = { [K in keyof TSlotProps]: SlotFn<TSlotProps[K]> };

export type UseSlotOptions<TSlotProps> = {
  slots: { [K in keyof TSlotProps]: NativeReactType | ComposableFunction<TSlotProps[K]> };
  filters?: { [K in keyof TSlotProps]?: (propName: string) => boolean };
  useStyling?: TSlotProps | GetSlotProps<TSlotProps>;
};

export type GetSlotProps<TSlotProps> = (...args: any[]) => TSlotProps;

export type UseSlotsBase<TSlotProps> = (...args: any[]) => Slots<TSlotProps>;

export function buildUseSlots<TSlotProps>(options: UseSlotOptions<TSlotProps>): UseSlotsBase<TSlotProps> {
  const { slots, filters = {}, useStyling } = options;
  return (...args: any[]) => {
    // get the baseline slot props to render with the slots
    const slotProps: TSlotProps =
      typeof useStyling === 'function' ? (useStyling as UseStyling<TSlotProps>)(...args) : ((useStyling || {}) as TSlotProps);

    // build up a set of slots closures and store them in props
    const builtSlots: Slots<TSlotProps> = {} as Slots<TSlotProps>;

    // for each slot go through and either cache the slot props or call part one render if it is staged
    Object.keys(slots).forEach((slotName) => {
      builtSlots[slotName] = useSlot(slots[slotName], slotProps[slotName], filters[slotName]);
    });

    // return the prebuilt closures, these will have internal references to state.results
    return builtSlots;
  };
}

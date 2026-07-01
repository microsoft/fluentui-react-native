import type { SlotComponent } from '../types/render.types.ts';
import { SLOT_COMPONENT_KEY, SLOT_PROPS_KEY, SLOT_PROP_TRANSFORM_KEY } from '../const.ts';
import { PropsFilter } from '../types/props.types.ts';
import { transformFromFilter } from '../utilities/filterProps.ts';
import { isPhasedComponent, isStagedComponent } from './phased.ts';
import { mergeProps } from '../merge-props/mergeProps.ts';

/**
 * Additional options for creating a slot
 */
export type CreateSlotOptions<TProps> = {
  filter?: PropsFilter;
  transform?: (props: TProps) => TProps;
  memo?: boolean;
};

/**
 * Convenience type, just referencing the statics of the component
 */
export type SlotComponentStatics<TProps> = Pick<
  SlotComponent<TProps>,
  typeof SLOT_COMPONENT_KEY | typeof SLOT_PROPS_KEY | typeof SLOT_PROP_TRANSFORM_KEY | 'displayName'
>;

/**
 * Set the slot statics for a new component, or to re-use an existing component
 * @param statics - The statics object to update.
 * @param component - The component to set as the slot component.
 * @param props - The base props for the slot component.
 * @param options - Optional settings for creating the slot.
 */
export function setSlotStatics<TProps>(
  statics: Partial<SlotComponentStatics<TProps>>,
  component: React.ComponentType<TProps>,
  props: TProps,
  options?: CreateSlotOptions<TProps>,
): SlotComponentStatics<TProps> {
  statics[SLOT_COMPONENT_KEY] = component;
  statics[SLOT_PROPS_KEY] = props;
  statics[SLOT_PROP_TRANSFORM_KEY] = options?.transform ?? transformFromFilter(options?.filter);
  if (component.displayName) {
    statics.displayName = component.displayName;
  }
  return statics as SlotComponentStatics<TProps>;
}

/**
 * Given a set of userProps, prepare the final props for a slot component
 * - merging with base props
 * - running the transform if present
 */
export function prepareSlotProps<TProps>(slotInfo: SlotComponentStatics<TProps>, userProps?: TProps): TProps {
  const baseProps = slotInfo[SLOT_PROPS_KEY];
  const transform = slotInfo[SLOT_PROP_TRANSFORM_KEY];
  const mergedProps = mergeProps<TProps>(baseProps, userProps) ?? ({} as TProps);
  return transform ? transform(mergedProps) : mergedProps;
}

/**
 * Check if a component is a slot component. Note that it explicitly rules out phased/staged as that uses the same
 * key for the component function but with a different signature.
 * @param component - The component to check.
 * @returns True if the component is a slot component, false otherwise.
 */
export function isSlotComponent<TProps>(component: unknown): component is SlotComponent<TProps> {
  return (
    component != null &&
    (component as SlotComponent<TProps>)[SLOT_COMPONENT_KEY] != null &&
    !isPhasedComponent(component) &&
    !isStagedComponent(component)
  );
}

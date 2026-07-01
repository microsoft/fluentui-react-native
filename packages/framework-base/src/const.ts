/**
 * Symbols used as keys for slot-related metadata in Furn components.
 */

/**
 * Key for the inner component for a slot, or the staged/phased render function for a phased component
 * @internal
 */
export const SLOT_COMPONENT_KEY = Symbol.for('furn.slotComponent');

/**
 * Key for attached props for a component that should be added to the final render output
 * @internal
 */
export const SLOT_PROPS_KEY = Symbol.for('furn.slotProps');

/**
 * Key for an attached optional final prop transform for the component
 * @internal
 */
export const SLOT_PROP_TRANSFORM_KEY = Symbol.for('furn.slotPropTransform');

/**
 * Key for the render type of a component, used to determine how the component should be rendered
 * @internal
 */
export const SLOT_RENDER_TYPE_KEY = Symbol.for('furn.slotRenderType');

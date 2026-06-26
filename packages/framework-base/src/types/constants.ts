/**
 * Internal reference for that marks a function component can be called directly to bypass a rendering layer
 * @internal
 */
export const RENDER_CAN_CALL_DIRECT = Symbol.for('furn._callDirect');

/**
 * Internal reference symbol for marking a component as supporting phased rendering
 * @internal
 */
export const RENDER_PHASED = Symbol.for('furn._phasedRender');

/**
 * Internal reference symbol for marking a component as being composable
 * @internal
 * @deprecated This pattern is deprecated in favor of the call direct pattern
 */
export const RENDER_CAN_COMPOSE = Symbol.for('furn._canCompose');

/**
 * Internal reference symbol for marking a component as supporting staged rendering
 * @internal
 * @deprecated This pattern is deprecated in favor of the phased rendering pattern.
 */
export const RENDER_STAGED = Symbol.for('furn._stagedRender');

/**
 * Temporary
 * symbols for slot properties
 */
export const SLOT_CLASS_NAME_PROP_SYMBOL = Symbol.for('furn._slotClassName');
export const SLOT_ELEMENT_TYPE_SYMBOL = Symbol.for('furn._slotElementType');
export const SLOT_RENDER_FUNCTION_SYMBOL = Symbol.for('furn._slotRenderFunction');

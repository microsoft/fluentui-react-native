import React from 'react';
import type { AnyComponent, SlotShorthandValue } from '../types/component.types';
import type {
  DirectComponent,
  LegacyDirectComponent,
  LegacyFunctionComponent,
  PhasedComponent,
  SlotComponent,
  StagedComponent,
} from '../types/render.types';
import { isIterable } from '../utilities/typeUtils';
import { SLOT_COMPONENT_KEY, SLOT_RENDER_TYPE_KEY } from '../const';
import { PropsWithRefOf } from '../types/props.types';

type PotentialComponentTypes = AnyComponent | React.ElementType | LegacyFunctionComponent<PropsWithRefOf<AnyComponent>>;

function getObjKeyValue(obj: unknown, key: string | symbol): unknown {
  if ((typeof obj === 'object' && obj !== null) || typeof obj === 'function') {
    return key in obj ? Reflect.get(obj, key) : undefined;
  }
  return undefined;
}

/**
 * Checks if a component is a direct component.
 * @param component the component to check
 * @return true if the component is a direct component, false otherwise
 */
export function isDirectComponent<Type extends AnyComponent>(
  component: PotentialComponentTypes,
): component is DirectComponent<PropsWithRefOf<Type>> {
  return getObjKeyValue(component, SLOT_RENDER_TYPE_KEY) === 'callable';
}

/**
 * Checks if a component is a legacy direct component
 * @param component the component to check
 * @return true if the component is a legacy direct component, false otherwise
 * @deprecated Prefer the directComponent or slot patterns if writing new code.
 */
export function isLegacyDirectComponent<Type extends AnyComponent>(
  component: PotentialComponentTypes,
): component is LegacyDirectComponent<PropsWithRefOf<Type>> {
  return getObjKeyValue(component, SLOT_RENDER_TYPE_KEY) === 'legacy';
}

/**
 * Checks if a component is a direct component or a legacy direct component.
 * @param component the component to check
 * @return true if the component is a direct component or a legacy direct component, false otherwise
 * @internal
 */
export function isDirectComponentType<Type extends AnyComponent>(
  component: PotentialComponentTypes,
): component is DirectComponent<PropsWithRefOf<Type>> | LegacyDirectComponent<PropsWithRefOf<Type>> {
  return isDirectComponent(component) || isLegacyDirectComponent(component);
}

/**
 * Determine if the component is a phased component
 */
export function isPhasedComponent<Type extends AnyComponent>(component: unknown): component is PhasedComponent<PropsWithRefOf<Type>> {
  return getObjKeyValue(component, SLOT_RENDER_TYPE_KEY) === 'phased';
}

/**
 * Determine if the component is a staged component, the legacy phased pattern
 */
export function isStagedComponent<Type extends AnyComponent>(component: unknown): component is StagedComponent<PropsWithRefOf<Type>> {
  return getObjKeyValue(component, SLOT_RENDER_TYPE_KEY) === 'phased-legacy';
}

/**
 * Check if a component is a slot component. Note that it explicitly rules out phased/staged as that uses the same
 * key for the component function but with a different signature.
 * @param component - The component to check.
 * @returns True if the component is a slot component, false otherwise.
 */
export function isSlotComponent<Type extends AnyComponent>(component: unknown): component is SlotComponent<PropsWithRefOf<Type>> {
  return (
    component != null &&
    getObjKeyValue(component, SLOT_COMPONENT_KEY) != null &&
    !isPhasedComponent(component) &&
    !isStagedComponent(component)
  );
}

/**
 * Is this element already a custom render type (direct, legacy direct, phased, staged, or slot)
 * @param component component to test
 * @returns True if the component is a custom render type, false otherwise.
 */
export function isCustomRenderType(component: PotentialComponentTypes) {
  return (
    (component as DirectComponent<PropsWithRefOf<AnyComponent>>)[SLOT_RENDER_TYPE_KEY] != null || (component as SlotComponent<PropsWithRefOf<AnyComponent>>)[SLOT_COMPONENT_KEY] != null
  );
}

/**
 * Is this element an object shorthand value for a slot, which is effectively anything that can be used as children
 * in react in standard usage.
 * @param value value to test
 * @returns True if the value is a slot shorthand value, false otherwise.
 */
export function isSlotShorthandValue(value: unknown): value is SlotShorthandValue {
  return (
    React.isValidElement(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    isIterable<React.ReactNode>(value) ||
    getObjKeyValue(value, '$$typeof') === Symbol.for('react.portal') // React portal check
  );
}

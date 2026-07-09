import { SLOT_COMPONENT_KEY, SLOT_RENDER_TYPE_KEY } from '../const';
import type {
  DirectComponent,
  FunctionComponent,
  LegacyDirectComponent,
  LegacyFunctionComponent,
  PhasedComponent,
  SlotComponent,
  StagedComponent,
} from '../types/render.types';

/**
 * Checks if a component is a direct component.
 * @param component the component to check
 * @return true if the component is a direct component, false otherwise
 */
export function isDirectComponent<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is DirectComponent<TProps> {
  return (component as DirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'callable';
}

/**
 * Checks if a component is a legacy direct component
 * @param component the component to check
 * @return true if the component is a legacy direct component, false otherwise
 * @deprecated Prefer the directComponent or slot patterns if writing new code.
 */
export function isLegacyDirectComponent<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is LegacyDirectComponent<TProps> {
  return (component as LegacyDirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'legacy';
}

/**
 * Checks if a component is a direct component or a legacy direct component.
 * @param component the component to check
 * @return true if the component is a direct component or a legacy direct component, false otherwise
 * @internal
 */
export function isDirectComponentType<TProps>(
  component: FunctionComponent<TProps> | LegacyFunctionComponent<TProps> | React.ElementType,
): component is DirectComponent<TProps> | LegacyDirectComponent<TProps> {
  return isDirectComponent(component) || isLegacyDirectComponent(component);
}

/**
 * Determine if the component is a phased component
 */
export function isPhasedComponent<TProps>(component: unknown): component is PhasedComponent<TProps> {
  return component != null && (component as PhasedComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'phased';
}

/**
 * Determine if the component is a staged component, the legacy phased pattern
 */
export function isStagedComponent<TProps>(component: unknown): component is StagedComponent<TProps> {
  return component != null && (component as StagedComponent<TProps>)[SLOT_RENDER_TYPE_KEY] === 'phased-legacy';
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

/**
 * Is this element already a custom render type (direct, legacy direct, phased, staged, or slot)
 * @param component component to test
 * @returns True if the component is a custom render type, false otherwise.
 */
export function isCustomRenderType<TProps>(component: React.ComponentType<TProps>) {
  return (
    (component as DirectComponent<TProps>)[SLOT_RENDER_TYPE_KEY] != null || (component as SlotComponent<TProps>)[SLOT_COMPONENT_KEY] != null
  );
}

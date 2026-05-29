/**
 * The framework a component is built against. Determines which build
 * blocks (`compose`, `useSlots`, token resolution) the component uses
 * and which packages it depends on.
 *
 * - `'v0'`: legacy framework. Built with `@uifabricshared/foundation-compose`
 *   (typically via files under `packages/deprecated`).
 * - `'v1'`: current framework. Built with `@fluentui-react-native/framework`
 *   and the composition primitives in `packages/framework/composition`.
 * - `'none'`: a plain React Native component with no framework wrapper.
 * - `'native'`: a native module that bridges a platform control.
 */
export const FRAMEWORK_VALUES = ['v0', 'v1', 'none', 'native'] as const;

export type Framework = (typeof FRAMEWORK_VALUES)[number];

export function isFramework(value: unknown): value is Framework {
  return typeof value === 'string' && (FRAMEWORK_VALUES as readonly string[]).includes(value);
}

/**
 * Standard shape values for components that vary their corner / border
 * geometry. Like `size`, `shape` is independent of interaction state.
 */
export const SHAPE_VALUES = ['rounded', 'circular', 'square'] as const;

export type Shape = (typeof SHAPE_VALUES)[number];

export function isShape(value: unknown): value is Shape {
  return typeof value === 'string' && (SHAPE_VALUES as readonly string[]).includes(value);
}

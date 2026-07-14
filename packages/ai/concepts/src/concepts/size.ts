/**
 * Standard size values. The values changed by `size` are visual only;
 * applying a different `size` should not interact with interaction
 * states like `hover` or `press`.
 */
export const SIZE_VALUES = ['small', 'medium', 'large'] as const;

export type Size = (typeof SIZE_VALUES)[number];

export function isSize(value: unknown): value is Size {
  return typeof value === 'string' && (SIZE_VALUES as readonly string[]).includes(value);
}

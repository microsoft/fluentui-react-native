/**
 * Standard appearance values supported across the library.
 *
 * A component's metadata declares the subset of appearances it accepts.
 * Components may also extend this set with custom values (e.g. Button
 * adds `'accent'` and `'outline'`); the metadata type accepts any
 * string for that reason, and `isAppearance` only validates against
 * the standard set here.
 */
export const APPEARANCE_VALUES = ['default', 'primary', 'subtle', 'transparent'] as const;

export type Appearance = (typeof APPEARANCE_VALUES)[number];

export function isAppearance(value: unknown): value is Appearance {
  return typeof value === 'string' && (APPEARANCE_VALUES as readonly string[]).includes(value);
}

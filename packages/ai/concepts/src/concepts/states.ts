/**
 * Interaction-driven visual states a component can opt into.
 *
 * - `'disabled'`: muted visuals, interactions suppressed; driven by a
 *   prop (typically `disabled`), not an interaction.
 * - `'hover'`: pointer hover-in / hover-out; driven by
 *   `usePressableState`-style hooks.
 * - `'press'`: tap / click; driven by `onPress` / `onClick`.
 * - `'checked'`: on/off toggle. Typically prop-driven via `checked`
 *   or `defaultChecked`.
 * - `'focused'`: the focus ring is shown; driven by
 *   `onFocus` / `onBlur`.
 *
 * A component lists every state it supports in its metadata; the
 * derived `ComponentStates` matrix applies each one in turn.
 */
export const COMPONENT_STATE_VALUES = ['disabled', 'hover', 'press', 'checked', 'focused'] as const;

export type ComponentState = (typeof COMPONENT_STATE_VALUES)[number];

export function isComponentState(value: unknown): value is ComponentState {
  return typeof value === 'string' && (COMPONENT_STATE_VALUES as readonly string[]).includes(value);
}

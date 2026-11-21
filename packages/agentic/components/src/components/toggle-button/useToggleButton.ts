import type { ToggleButtonProps, ToggleButtonState } from './toggle-button.types';

/** State-stage handoff: one selection owner for press and native Toggle, with a ref on the same focus target. */
export type UseToggleButton = (props: ToggleButtonProps) => ToggleButtonState;

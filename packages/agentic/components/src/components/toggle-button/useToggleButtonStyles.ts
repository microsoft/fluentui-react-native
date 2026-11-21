import type { ToggleButtonState } from './toggle-button.types';

/** Style-stage handoff: resolve Subtle Button geometry and selection tokens before applying caller visuals. */
export type UseToggleButtonStyles = (state: ToggleButtonState) => void;

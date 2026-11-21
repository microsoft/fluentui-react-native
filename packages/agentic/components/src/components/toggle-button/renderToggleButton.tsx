import type { ReactElement } from 'react';
import type { ToggleButtonState } from './toggle-button.types';

/** Render-stage handoff: order resolved slots without hooks; reserve the selected label's width in both states. */
export type RenderToggleButton = (state: ToggleButtonState) => ReactElement;

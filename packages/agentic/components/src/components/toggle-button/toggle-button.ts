import type { ReactElement } from 'react';
import type { ToggleButtonProps } from './toggle-button.types';

/** Assembly signature only. Do not expose a component value until state, styles and rendering are implemented. */
export type ToggleButtonComponent = (props: ToggleButtonProps) => ReactElement;

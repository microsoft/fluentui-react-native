import { renderButton_unstable } from '../button/renderButton';
import type { ToolbarButtonState } from './toolbar-button.types';

export function renderToolbarButton_unstable(state: ToolbarButtonState) {
  return state.valid ? renderButton_unstable(state) : null;
}

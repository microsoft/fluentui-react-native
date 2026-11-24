import { renderButton_unstable } from '../button/renderButton';
import type { DestructiveButtonState } from './destructive-button.types';

export function renderDestructiveButton_unstable(state: DestructiveButtonState) {
  return state.hasCommand ? renderButton_unstable(state) : null;
}

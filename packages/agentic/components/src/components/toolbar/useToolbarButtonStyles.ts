import { useButtonStyles_unstable } from '../button/useButtonStyles';
import type { ToolbarButtonState } from './toolbar-button.types';

export function useToolbarButtonStyles_unstable(state: ToolbarButtonState) {
  useButtonStyles_unstable(state);
}

import type { ToggleButtonProps } from './toggle-button.types';
import { renderToggleButton_unstable } from './renderToggleButton';
import { useToggleButton_unstable } from './useToggleButton';
import { useToggleButtonStyles_unstable } from './useToggleButtonStyles';

export function ToggleButton(props: ToggleButtonProps) {
  const state = useToggleButton_unstable(props);
  useToggleButtonStyles_unstable(state);
  return renderToggleButton_unstable(state);
}
ToggleButton.displayName = 'ToggleButton';

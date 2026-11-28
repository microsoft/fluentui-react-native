import { renderSpinButton_unstable } from './renderSpinButton';
import type { SpinButtonProps } from './spin-button.types';
import { useSpinButton_unstable } from './useSpinButton';
import { useSpinButtonStyles_unstable } from './useSpinButtonStyles';

export const SpinButton = (props: SpinButtonProps) => {
  const state = useSpinButton_unstable(props);
  useSpinButtonStyles_unstable(state);
  return renderSpinButton_unstable(state);
};
SpinButton.displayName = 'SpinButton';

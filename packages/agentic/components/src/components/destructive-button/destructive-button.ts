import type { DestructiveButtonProps } from './destructive-button.types';
import { useDestructiveButton_unstable } from './useDestructiveButton';
import { useDestructiveButtonStyles_unstable } from './useDestructiveButtonStyles';
import { renderDestructiveButton_unstable } from './renderDestructiveButton';

/**
 * A DestructiveButton component, which triggers a single irreversible or high-consequence action and
 * carries the danger color family so the control itself signals the outcome.
 */
export const DestructiveButton = (props: DestructiveButtonProps) => {
  const state = useDestructiveButton_unstable(props);
  useDestructiveButtonStyles_unstable(state);
  return renderDestructiveButton_unstable(state);
};
DestructiveButton.displayName = 'DestructiveButton';

export default DestructiveButton;

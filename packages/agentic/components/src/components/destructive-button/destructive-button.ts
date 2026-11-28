import type { DestructiveButtonProps } from './destructive-button.types';
import { renderDestructiveButton_unstable } from './renderDestructiveButton';
import { useDestructiveButton_unstable } from './useDestructiveButton';
import { useDestructiveButtonStyles_unstable } from './useDestructiveButtonStyles';

export const DestructiveButton = (props: DestructiveButtonProps) => {
  const state = useDestructiveButton_unstable(props);
  useDestructiveButtonStyles_unstable(state);
  return renderDestructiveButton_unstable(state);
};

DestructiveButton.displayName = 'DestructiveButton';

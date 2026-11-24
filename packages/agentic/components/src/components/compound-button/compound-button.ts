import type { CompoundButtonProps } from './compound-button.types';
import { renderCompoundButton_unstable } from './renderCompoundButton';
import { useCompoundButton_unstable } from './useCompoundButton';
import { useCompoundButtonStyles_unstable } from './useCompoundButtonStyles';

export const CompoundButton = (props: CompoundButtonProps) => {
  const state = useCompoundButton_unstable(props);
  useCompoundButtonStyles_unstable(state);
  return renderCompoundButton_unstable(state);
};

CompoundButton.displayName = 'CompoundButton';

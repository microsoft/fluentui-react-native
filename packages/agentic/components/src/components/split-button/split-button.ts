import { renderSplitButton_unstable } from './renderSplitButton';
import type { SplitButtonProps } from './split-button.types';
import { useSplitButton_unstable } from './useSplitButton';
import { useSplitButtonStyles_unstable } from './useSplitButtonStyles';

export function SplitButton(props: SplitButtonProps) {
  const state = useSplitButton_unstable(props);
  useSplitButtonStyles_unstable(state);
  return renderSplitButton_unstable(state);
}
SplitButton.displayName = 'SplitButton';

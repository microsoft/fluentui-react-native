import type { ToolbarButtonProps } from './toolbar-button.types';
import { useToolbarButton_unstable } from './useToolbarButton';
import { useToolbarButtonStyles_unstable } from './useToolbarButtonStyles';
import { renderToolbarButton_unstable } from './renderToolbarButton';

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const state = useToolbarButton_unstable(props);
  useToolbarButtonStyles_unstable(state);
  return renderToolbarButton_unstable(state);
};
ToolbarButton.displayName = 'ToolbarButton';

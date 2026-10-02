import type { ToolbarProps } from './toolbar.types';
import { useToolbar_unstable } from './useToolbar';
import { useToolbarStyles_unstable } from './useToolbarStyles';
import { renderToolbar_unstable } from './renderToolbar';

export const Toolbar = (props: ToolbarProps) => {
  const state = useToolbar_unstable(props);
  useToolbarStyles_unstable(state);
  return renderToolbar_unstable(state);
};
Toolbar.displayName = 'Toolbar';

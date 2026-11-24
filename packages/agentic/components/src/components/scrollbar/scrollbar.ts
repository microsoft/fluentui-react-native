import { renderScrollbar_unstable } from './renderScrollbar';
import type { ScrollbarProps } from './scrollbar.types';
import { useScrollbar_unstable } from './useScrollbar';
import { useScrollbarStyles_unstable } from './useScrollbarStyles';

export const Scrollbar = (props: ScrollbarProps) => {
  const state = useScrollbar_unstable(props);
  useScrollbarStyles_unstable(state);
  return renderScrollbar_unstable(state);
};
Scrollbar.displayName = 'Scrollbar';

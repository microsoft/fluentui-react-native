import type { DividerProps } from './divider.types';
import { useDivider_unstable } from './useDivider';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderDivider_unstable } from './renderDivider';

/**
 * A non-interactive visual separator for section grouping.
 */
export const Divider = (props: DividerProps) => {
  const state = useDivider_unstable(props);
  useApplyStyles_unstable(state);
  return renderDivider_unstable(state);
};

Divider.displayName = 'Divider';

export default Divider;

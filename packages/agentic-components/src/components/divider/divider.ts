import type { DividerProps } from './divider.types';
import { useDivider_unstable } from './useDivider';
import { useDividerStyles_unstable } from './useDividerStyles';
import { renderDivider_unstable } from './renderDivider';

/**
 * A non-interactive visual separator for section grouping.
 */
export const Divider = (props: DividerProps) => {
  const state = useDivider_unstable(props);
  useDividerStyles_unstable(state);
  return renderDivider_unstable(state);
};

Divider.displayName = 'Divider';

export default Divider;

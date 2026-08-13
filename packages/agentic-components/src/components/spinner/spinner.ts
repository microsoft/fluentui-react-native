import type { SpinnerProps } from './spinner.types';
import { useSpinner_unstable } from './useSpinner';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderSpinner_unstable } from './renderSpinner';

/**
 * An indeterminate progress indicator that communicates ongoing work.
 */
export const Spinner = (props: SpinnerProps) => {
  const state = useSpinner_unstable(props);
  useApplyStyles_unstable(state);
  return renderSpinner_unstable(state);
};

Spinner.displayName = 'Spinner';

export default Spinner;

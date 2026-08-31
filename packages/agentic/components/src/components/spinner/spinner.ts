import type { SpinnerProps } from './spinner.types';
import { useSpinner_unstable } from './useSpinner';
import { useSpinnerStyles_unstable } from './useSpinnerStyles';
import { renderSpinner_unstable } from './renderSpinner';

/**
 * An indeterminate progress indicator that communicates ongoing work.
 */
export const Spinner = (props: SpinnerProps) => {
  const state = useSpinner_unstable(props);
  useSpinnerStyles_unstable(state);
  return renderSpinner_unstable(state);
};

Spinner.displayName = 'Spinner';

export default Spinner;

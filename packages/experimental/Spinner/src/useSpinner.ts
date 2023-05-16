import type { SpinnerProps, SpinnerState } from './Spinner.types';

export const useSpinner = (props: SpinnerProps): SpinnerState => {
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    size: 'medium',
    ...props,
  };
};

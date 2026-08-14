import type { ProgressBarProps } from './progress-bar.types';
import { renderProgressBar_unstable } from './renderProgressBar';
import { useProgressBarStyles_unstable } from './useProgressBarStyles';
import { useProgressBar_unstable } from './useProgressBar';

export const ProgressBar = (props: ProgressBarProps) => {
  const state = useProgressBar_unstable(props);
  useProgressBarStyles_unstable(state);
  return renderProgressBar_unstable(state);
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

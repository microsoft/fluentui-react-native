import type { ViewProps } from 'react-native';

/**
 * Thin wrapper around the AppKit `NSProgressIndicator` control.
 * https://developer.apple.com/documentation/appkit/nsprogressindicator
 */
export interface ProgressIndicatorProps extends ViewProps {
  /** Bar (determinate progress bar) or spinner (indeterminate spinner) presentation. Defaults to 'bar'. */
  indicatorStyle?: 'bar' | 'spinner';
  /** Whether the indicator shows an indeterminate (animating, unknown-duration) state. Defaults to true. */
  indeterminate?: boolean;
  /** Current progress value, used when `indeterminate` is false. */
  value?: number;
  /** Minimum value of the determinate range. Defaults to 0. */
  minValue?: number;
  /** Maximum value of the determinate range. Defaults to 100. */
  maxValue?: number;
  /** Starts (true) or stops (false) the indicator's animation. */
  animating?: boolean;
}

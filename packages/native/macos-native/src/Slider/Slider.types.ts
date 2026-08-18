import type { ViewProps } from 'react-native';

/**
 * Thin wrapper around the AppKit `NSSlider` control.
 * https://developer.apple.com/documentation/appkit/nsslider
 */
export interface SliderProps extends ViewProps {
  /** Controlled numeric value. */
  value?: number;
  /** Uncontrolled initial numeric value. */
  defaultValue?: number;
  /** Minimum value of the slider. Defaults to 0. */
  minimumValue?: number;
  /** Maximum value of the slider. Defaults to 100. */
  maximumValue?: number;
  /** Number of tick marks to render along the slider, if any. */
  numberOfTickMarks?: number;
  /** Whether onValueChange fires continuously while dragging (true) or only on release (false). Defaults to true. */
  continuous?: boolean;
  /** Disables user interaction with the slider. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired as the user drags (or on release, depending on `continuous`). */
  onValueChange?: (value: number) => void;
}

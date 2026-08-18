import type { ViewProps } from 'react-native';

/**
 * Thin wrapper around the AppKit `NSStepper` increment/decrement control.
 * https://developer.apple.com/documentation/appkit/nsstepper
 */
export interface StepperProps extends ViewProps {
  /** Controlled numeric value. */
  value?: number;
  /** Uncontrolled initial numeric value. */
  defaultValue?: number;
  /** Minimum value the stepper can reach. Defaults to 0. */
  minimumValue?: number;
  /** Maximum value the stepper can reach. Defaults to 100. */
  maximumValue?: number;
  /** Amount added/subtracted per click. Defaults to 1. */
  increment?: number;
  /** Whether holding the stepper repeats the increment/decrement action. */
  autorepeat?: boolean;
  /** Whether the value wraps around past minimumValue/maximumValue. */
  wraps?: boolean;
  /** Disables user interaction with the stepper. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired when the user changes the stepper's value. */
  onValueChange?: (value: number) => void;
}

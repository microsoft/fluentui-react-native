import type { ViewProps } from 'react-native';

/**
 * Thin wrapper around the AppKit `NSSwitch` toggle control.
 * https://developer.apple.com/documentation/appkit/nsswitch
 */
export interface SwitchProps extends ViewProps {
  /** Controlled on/off state of the switch. */
  value?: boolean;
  /** Uncontrolled initial on/off state of the switch. */
  defaultValue?: boolean;
  /** Disables user interaction with the switch. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired when the user toggles the switch. */
  onValueChange?: (value: boolean) => void;
}

import { ButtonSlotProps, ButtonTokens, ButtonComposedProps } from '../Button.types';

export const toggleButtonName = 'ToggleButton';

export interface ToggleButtonTokens extends ButtonTokens {
  checked?: ToggleButtonTokens;
}

export interface ToggleButtonComposedProps extends ButtonComposedProps {
  /**
   * Defines the controlled checked state of the `ToggleButton`.
   * Mutually exclusive to `defaultChecked`.
   * This should only be used if the checked state is to be controlled at a higher level and there is a plan to pass the
   * correct value based on handling `onClick` events and re-rendering.
   */
  checked?: boolean;
  /**
   * Defines whether the `ToggleButton` is inititally in a checked state or not when rendered.
   * Mutually exclusive to `checked`.
   */
  defaultChecked?: boolean;
}

export type ToggleButtonProps = Omit<ToggleButtonComposedProps, 'innerRef'>;

export interface ToggleButtonSlotProps extends ButtonSlotProps {}

export interface ToggleButtonType {
  props: ToggleButtonComposedProps;
  tokens: ToggleButtonTokens;
  slotProps: ToggleButtonSlotProps;
}

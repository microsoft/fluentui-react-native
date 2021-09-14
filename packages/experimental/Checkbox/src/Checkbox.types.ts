import * as React from 'react';
import { ColorValue } from 'react-native';
import { FontTokens, IBorderTokens, IForegroundColorTokens, IBackgroundColorTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import type { ITextProps, IViewProps } from '@fluentui-react-native/adapters';

export const checkboxName = 'Checkbox';

export interface CheckboxTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  checkboxBackgroundColor?: ColorValue;
  checkboxBorderColor?: ColorValue;
  checkmarkColor?: ColorValue;
  checkmarkOpacity?: number;
  textBorderColor?: ColorValue;
  checkboxBorderRadius?: number;
  checkboxMarginStart?: number;
  checkboxMarginEnd?: number;
  checkboxOpacity?: number;

  /**
   * States that can be applied to a checkbox
   */
  disabled?: CheckboxTokens;
  boxAtEnd?: CheckboxTokens;
  hovered?: CheckboxTokens;
  focused?: CheckboxTokens;
  pressed?: CheckboxTokens;
  checked?: CheckboxTokens;
}

export interface CheckboxProps extends Omit<IViewProps, 'onPress'> {
  /**
   * Checked state. Mutually exclusive to “defaultChecked”. Use this if you control the checked state at a higher level
   * and plan to pass in the correct value based on handling onChange events and re-rendering.
   */
  checked?: boolean;

  /**
   * Default checked state. Mutually exclusive to ‘checked’. Use this if you want an uncontrolled component, and
   * want the Checkbox instance to maintain its own state.
   */
  defaultChecked?: boolean;

  /**
   * Allows you to set the checkbox to be at the before (start) or after (end) the label
   */
  boxSide?: 'start' | 'end';

  /**
   * Disabled state of the checkbox.
   */
  disabled?: boolean;

  /**
   * Label to display next to the checkbox.
   */
  label?: string;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Callback that is called when the checked value has changed.
   */
  onChange?: (isChecked: boolean) => void;

  /**
   * Provides a tooltip while hovering over Checkbox component
   */
  tooltip?: string;
}

export interface CheckboxState extends IPressableState {
  /**
   * Whether the Checkbox is checked or not
   */
  checked?: boolean;

  /**
   * Whether the Checkbox is disabled or not
   */
  disabled?: boolean;

  /**
   * Determines position of Checkbox. True if boxSide='end'
   */
  boxAtEnd?: boolean;
}

export interface CheckboxInfo {
  props: CheckboxProps & React.ComponentPropsWithRef<any>;
  state: CheckboxState;
}

export interface CheckboxSlotProps {
  root: React.PropsWithRef<IViewProps>;
  checkbox: IViewProps;
  checkmark?: ITextProps;
  content: ITextProps;
}

export interface CheckboxType {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: CheckboxSlotProps;
  state: CheckboxState;
}

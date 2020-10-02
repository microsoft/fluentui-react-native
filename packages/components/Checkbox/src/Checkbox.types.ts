import * as React from 'react';
// import { IPressableProps } from '@fluentui-react-native/pressable';
import { IPressableState, IFocusable } from '@fluentui-react-native/interactive-hooks';
import { ViewProps, TextProps } from 'react-native';
import { BackgroundColorTokenSet, BorderTokenSet, FontTokenSet, ForegroundColorTokenSet } from '@fluentui-react-native/framework';

export const checkboxName = 'Checkbox';

export interface CheckboxState extends IPressableState {
  /**
   * Whether the Checkbox is checked or not
   */
  checked?: boolean;

  /**
   * Whether the Checkbox is disabled or not
   */
  disabled?: boolean;
}

/**
 * Values that can be set via props or via tokens
 */
export interface CheckboxTokenProps {
  /**
   * Allows you to set the checkbox to be at the before (start) or after (end) the label
   */
  boxSide?: 'start' | 'end';
}

/**
 * List of tokens that are also props, should include values in the above type
 */
export const tokensThatAreAlsoProps: (keyof CheckboxTokenProps)[] = ['boxSide'];

export interface CheckboxProps extends CheckboxTokenProps {
  /**
   * An optional string for the Narrator to read. If not provided, this will be set to the Checkbox label
   */
  ariaLabel?: string;

  /**
   ** Checked state. Mutually exclusive to “defaultChecked”. Use this if you control the checked state at a higher level
   ** and plan to pass in the correct value based on handling onChange events and re-rendering.
   */
  checked?: boolean;

  /**
   ** Default checked state. Mutually exclusive to ‘checked’. Use this if you want an uncontrolled component, and
   ** want the Checkbox instance to maintain its own state.
   */
  defaultChecked?: boolean;

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

  testID?: string;
}

/**
 * Checkbox tokens mix in standard font customizations, border customizations, foreground and background color customizations
 */
export interface CheckboxTokens extends CheckboxTokenProps, FontTokenSet, BorderTokenSet, ForegroundColorTokenSet, BackgroundColorTokenSet {
  checkboxBackgroundColor?: string;
  checkboxBorderColor?: string;
  checkmarkColor?: string;
  checkmarkVisibility?: number;
  checkmarkText?: string;
  textBorderColor?: string;

  // various visual states which can be applied to the checkbox
  disabled?: CheckboxTokens;
  hovered?: CheckboxTokens;
  focused?: CheckboxTokens;
  pressed?: CheckboxTokens;
  checked?: CheckboxTokens;
}

export interface CheckboxSlotProps {
  root: React.PropsWithRef<ViewProps>;
  checkbox: ViewProps;
  checkmark: TextProps;
  content: TextProps;
}

export interface CheckboxType {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: CheckboxSlotProps;
}

import * as React from 'react';
// import { IPressableProps } from '@fluentui-react-native/pressable';
import { IPressableState, IFocusable } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const checkboxName = 'Checkbox';

export interface ICheckboxState extends IPressableState {
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

export interface ICheckboxProps {
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

  testID?: string;
}

export interface ICheckboxTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  checkboxBackgroundColor?: string;
  checkboxBorderColor?: string;
  checkmarkColor?: string;
  checkmarkVisibility?: number;
  textBorderColor?: string;
}

export interface ICheckboxSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  checkbox: ViewProps;
  checkmark: ITextProps;
  content: ITextProps;
}

export type ICheckboxRenderData = IRenderData<ICheckboxSlotProps, ICheckboxState>;

export interface ICheckboxType {
  props: ICheckboxProps;
  tokens: ICheckboxTokens;
  slotProps: ICheckboxSlotProps;
  state: ICheckboxState;
}

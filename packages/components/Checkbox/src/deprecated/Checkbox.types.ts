import type * as React from 'react';
import type { ColorValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IPressableState, IFocusable } from '@fluentui-react-native/interactive-hooks';
// import { IPressableProps } from '@fluentui-react-native/pressable';
import type { ITextProps } from '@fluentui-react-native/text';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { IRenderData } from '@uifabricshared/foundation-composable';

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export const checkboxName = 'Checkbox';

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
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

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export interface ICheckboxProps extends Omit<IViewProps, 'onPress'> {
  /**
   * An string for screen readers to read. If not provided, this will be set to the Checkbox label
   * @deprecated Use accessibilityLabel instead.
   */
  ariaLabel?: string;

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

  testID?: string;

  /**
   * Provides a tooltip while hovering over Checkbox component
   */
  tooltip?: string;
}

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export interface ICheckboxTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  checkboxBackgroundColor?: ColorValue;
  checkboxBorderColor?: ColorValue;
  checkmarkColor?: ColorValue;
  checkmarkVisibility?: number;
  textBorderColor?: ColorValue;
}

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export interface ICheckboxSlotProps {
  root: React.PropsWithRef<IViewProps>;
  checkbox: IViewProps;
  checkmark?: ITextProps;
  content: ITextProps;
}

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export type ICheckboxRenderData = IRenderData<ICheckboxSlotProps, ICheckboxState>;

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export interface ICheckboxType {
  props: ICheckboxProps;
  tokens: ICheckboxTokens;
  slotProps: ICheckboxSlotProps;
  state: ICheckboxState;
}

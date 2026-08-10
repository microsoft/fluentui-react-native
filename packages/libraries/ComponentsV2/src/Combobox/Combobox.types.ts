import type * as React from 'react';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';

import type { InteractionEvent } from '@fluentui/react-native';

export type ComboboxAppearance = 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
export type ComboboxSize = 'small' | 'medium' | 'large';
export type ComboboxInteractionEvent = InteractionEvent;

export interface ComboboxOptionData {
  disabled: boolean;
  text: string;
  value: string;
}

export interface ComboboxOptionSelectData {
  optionText?: string;
  optionValue?: string;
  selectedOptions: string[];
}

export interface ComboboxOpenChangeData {
  open: boolean;
}

export interface ComboboxActiveOptionChangeData {
  nextOption?: ComboboxOptionData;
}

export interface ComboboxProps extends Omit<ViewProps, 'children'> {
  /**
   * Controls the field surface treatment.
   * @default 'outline'
   */
  appearance?: ComboboxAppearance;

  /**
   * Child ComboboxOption and ComboboxOptionGroup elements.
   */
  children?: React.ReactNode;

  /**
   * Shows a clear affordance after a single option is selected.
   * @default false
   */
  clearable?: boolean;

  /**
   * The initially selected option values for an uncontrolled Combobox.
   */
  defaultSelectedOptions?: string[];

  /**
   * The initial text value for an uncontrolled Combobox.
   * @default ''
   */
  defaultValue?: string;

  /**
   * Prevents editing, expansion, and selection.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allows values that are not present in the option collection.
   * @default false
   */
  freeform?: boolean;

  /**
   * Additional props applied to the native text input.
   */
  inputProps?: Omit<
    TextInputProps,
    'defaultValue' | 'editable' | 'onChangeText' | 'placeholder' | 'style' | 'value'
  >;

  /**
   * Additional style applied to the native text input.
   */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Additional style applied to the expanded listbox.
   */
  listboxStyle?: StyleProp<ViewStyle>;

  /**
   * Enables multiple selected options.
   * @default false
   */
  multiselect?: boolean;

  /**
   * Called when keyboard or pointer navigation changes the active option.
   */
  onActiveOptionChange?: (
    event: ComboboxInteractionEvent,
    data: ComboboxActiveOptionChangeData,
  ) => void;

  /**
   * Called when the editable text value changes.
   */
  onChangeText?: (value: string) => void;

  /**
   * Called when the expanded state changes.
   */
  onOpenChange?: (event: ComboboxInteractionEvent, data: ComboboxOpenChangeData) => void;

  /**
   * Called after an option is selected or deselected.
   */
  onOptionSelect?: (event: ComboboxInteractionEvent, data: ComboboxOptionSelectData) => void;

  /**
   * The controlled expanded state.
   */
  open?: boolean;

  /**
   * Placeholder shown when the editable value is empty.
   */
  placeholder?: string;

  /**
   * The controlled selected option values.
   */
  selectedOptions?: string[];

  /**
   * Controls field height and typography.
   * @default 'medium'
   */
  size?: ComboboxSize;

  /**
   * The controlled editable text value.
   */
  value?: string;
}

export interface ComboboxOptionProps extends Omit<ViewProps, 'children'> {
  /**
   * Option content. Non-string content requires the text prop.
   */
  children?: React.ReactNode;

  /**
   * Custom selected-state glyph.
   */
  checkIcon?: React.ReactNode;

  /**
   * Prevents selection while retaining the option in the list.
   * @default false
   */
  disabled?: boolean;

  /**
   * Plain text used for input value and type matching.
   */
  text?: string;

  /**
   * Unique option value. Defaults to text.
   */
  value?: string;
}

export interface ComboboxOptionGroupProps extends Omit<ViewProps, 'children'> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  labelStyle?: StyleProp<TextStyle>;
}

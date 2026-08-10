import type * as React from 'react';

import type { InteractionEvent, PressablePropsExtended } from '@fluentui/react-native';

export type CheckboxCheckedState = boolean | 'mixed';
export type CheckboxLabelPosition = 'before' | 'after';
export type CheckboxShape = 'square' | 'circular';
export type CheckboxSize = 'medium' | 'large';

export interface CheckboxOnChangeData {
  checked: CheckboxCheckedState;
}

export interface CheckboxProps extends Omit<PressablePropsExtended, 'children' | 'disabled' | 'onPress'> {
  /**
   * The controlled checked state.
   * @default false
   */
  checked?: CheckboxCheckedState;

  /**
   * The initial checked state for an uncontrolled Checkbox.
   * @default false
   */
  defaultChecked?: CheckboxCheckedState;

  /**
   * Prevents focus and interaction.
   * @default false
   */
  disabled?: boolean;

  /**
   * The visible label associated with the Checkbox.
   */
  label?: React.ReactNode;

  /**
   * Positions the label relative to the indicator.
   * @default 'after'
   */
  labelPosition?: CheckboxLabelPosition;

  /**
   * Called after user interaction requests a checked-state change.
   */
  onChange?: (event: InteractionEvent, data: CheckboxOnChangeData) => void;

  /**
   * Marks the Checkbox as required for accessibility and adds a required indicator to its label.
   * @default false
   */
  required?: boolean;

  /**
   * Controls the indicator shape.
   * @default 'square'
   */
  shape?: CheckboxShape;

  /**
   * Controls the indicator and glyph size.
   * @default 'medium'
   */
  size?: CheckboxSize;
}

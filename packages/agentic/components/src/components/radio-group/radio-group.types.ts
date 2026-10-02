import type * as React from 'react';
import type { AccessibilityState, View } from 'react-native';
import type { ComponentState, FocusKeyboardEvent, OwnedRootProps, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Label } from '../label/label';
import type { RadioGroupContextValue } from './RadioGroupContext';

export type RadioGroupOrientation = 'vertical' | 'horizontal';
export type RadioGroupDirection = 'ltr' | 'rtl';
export type RadioGroupSlots = { root: Slot<typeof View> };

export type RadioGroupProps = OwnedRootProps<
  PropsWithRefOf<typeof View>,
  | 'accessibilityRole'
  | 'role'
  | 'accessible'
  | 'focusable'
  | 'tabIndex'
  | 'keyDownEvents'
  | 'keyUpEvents'
  | 'validKeysDown'
  | 'validKeysUp'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'accessibilityState'
  | 'aria-label'
  | 'aria-labelledby'
  | 'accessibilityLabelledBy'
  | 'aria-checked'
  | 'aria-selected'
  | 'aria-disabled'
  | 'aria-required'
> & {
  label: string;
  children: React.ReactNode;
  selectedValue?: string | null;
  defaultSelectedValue?: string | null;
  onSelectionChange?: (value: string | null) => void;
  orientation?: RadioGroupOrientation;
  direction?: RadioGroupDirection;
  /** Visual marker only; not native required state or validation. */
  required?: boolean;
  disabled?: boolean;
  accessibilityState?: Omit<AccessibilityState, 'checked' | 'selected' | 'disabled' | 'required' | 'multiselectable'>;
  as?: React.ComponentType<PropsWithRefOf<typeof View>>;
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
};

type RadioGroupStateSlots = RadioGroupSlots & {
  legend: Slot<typeof Label>;
  options: Slot<typeof View>;
};

export type RadioGroupState = ComponentState<RadioGroupStateSlots> &
  ThemeState & {
    children: React.ReactNode;
    contextValue: RadioGroupContextValue;
    orientation: RadioGroupOrientation;
    direction: RadioGroupDirection;
    selectedValue: string | null;
    disabled: boolean;
    required: boolean;
    userStyle: PropsWithRefOf<typeof View>['style'];
  };

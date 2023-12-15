import * as React from 'react';
import type { View } from 'react-native';
import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { useSelectedKey as useValue } from '@fluentui-react-native/interactive-hooks';

import type { RadioGroupInfo, RadioGroupProps, RadioGroupState } from './RadioGroup.types';

export const useRadioGroup = (props: RadioGroupProps): RadioGroupInfo => {
  const {
    accessible,
    value,
    defaultValue,
    disabled,
    required,
    layout,
    onChange,
    isCircularNavigation,
    accessibilityLabel,
    label,
    accessibilityState,
  } = props;

  // This hook updates the selected Radio and calls the customer's onClick function. This gets called after a button is pressed.
  const data = useValue(value || defaultValue || null, onChange);

  const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

  const onSelectButtonRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedButtonRef(ref);
    },
    [setSelectedButtonRef],
  );

  const [invoked, setInvoked] = React.useState(false);

  const onInvoked = React.useCallback(
    (check: boolean) => {
      setInvoked(check);
    },
    [setInvoked],
  );

  const [values, setValues] = React.useState([]);

  const onAddRadioValue = React.useCallback(
    (value: string) => {
      setValues((values) => [...values, value]);
    },
    [setValues],
  );

  const onRemoveRadioValue = React.useCallback(
    (value: string) => {
      setValues((values) => values.filter((item) => item !== value));
    },
    [setValues],
  );

  const [enabledValues, setEnabledValues] = React.useState([]);

  const onAddRadioEnabledValue = React.useCallback(
    (value: string) => {
      setEnabledValues((enabledValues) => [...enabledValues, value]);
    },
    [setEnabledValues],
  );

  const onRemoveRadioEnabledValue = React.useCallback(
    (value: string) => {
      setEnabledValues((enabledValues) => enabledValues.filter((item) => item !== value));
    },
    [setEnabledValues],
  );

  const state: RadioGroupState = {
    value: data.selectedKey,
    required: required || false,
    disabled: disabled || false,
    layout: layout || 'vertical',
    onChange: data.onKeySelect,
    updateSelectedButtonRef: onSelectButtonRef,
    invoked: invoked,
    updateInvoked: onInvoked,
    values: values,
    enabledValues: enabledValues,
    addRadioValue: onAddRadioValue,
    removeRadioValue: onRemoveRadioValue,
    addRadioEnabledValue: onAddRadioEnabledValue,
    removeRadioEnabledValue: onRemoveRadioEnabledValue,
    selectedButtonDisabled: values.includes(data.selectedKey) && !enabledValues.includes(data.selectedKey),
  };

  return {
    props: {
      ...props,
      required,
      layout,
      accessible: accessible ?? true,
      accessibilityRole: 'radiogroup',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: getAccessibilityState(state.disabled, state.required, accessibilityState),
      defaultTabbableElement: selectedButtonRef,
      isCircularNavigation: isCircularNavigation ?? true,
    },
    state: {
      ...state,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, required: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled, required, ...accessibilityState };
  }
  return { disabled, required };
}

import * as React from 'react';
import { RadioGroupInfo, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { useSelectedKey as useValue } from '@fluentui-react-native/interactive-hooks';
import { View } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

export const useRadioGroup = (props: RadioGroupProps): RadioGroupInfo => {
  const { value, defaultValue, disabled, required, layout, onChange, isCircularNavigation, accessibilityLabel, label, accessibilityState } =
    props;

  // This hook updates the selected Radio and calls the customer's onClick function. This gets called after a button is pressed.
  const data = useValue(value || defaultValue || null, onChange);

  const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

  const onSelectButtonRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedButtonRef(ref);
    },
    [setSelectedButtonRef],
  );

  const state: RadioGroupState = {
    value: data.selectedKey,
    required: required || false,
    disabled: disabled || false,
    layout: layout || 'vertical',
    onChange: data.onKeySelect,
    updateSelectedButtonRef: onSelectButtonRef,
  };

  return {
    props: {
      ...props,
      required,
      layout,
      accessible: true,
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

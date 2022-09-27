import * as React from 'react';
import { RadioGroupInfo, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { useSelectedKey as useValue } from '@fluentui-react-native/interactive-hooks';
import { View } from 'react-native';

export const useRadioGroup = (props: RadioGroupProps): RadioGroupInfo => {
  const { value, defaultValue, disabled, onChange, isCircularNavigation, accessibilityLabel, label } = props;

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
    disabled: disabled || false,
    onChange: data.onKeySelect,
    updateSelectedButtonRef: onSelectButtonRef,
  };

  return {
    props: {
      ...props,
      disabled,
      accessible: true,
      accessibilityRole: 'radiogroup',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: { disabled: state.disabled },
      defaultTabbableElement: selectedButtonRef,
      isCircularNavigation: isCircularNavigation ?? true,
    },
    state: {
      ...state,
    },
  };
};

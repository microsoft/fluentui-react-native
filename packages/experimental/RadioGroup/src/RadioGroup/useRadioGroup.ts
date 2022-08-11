import * as React from 'react';
import { RadioGroupInfo, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { useSelectedKey as useValue } from '@fluentui-react-native/interactive-hooks';
import { View } from 'react-native';

export const useRadioGroup = (props: RadioGroupProps): RadioGroupInfo => {
  const { value, defaultValue, onChange } = props;

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
    context: {
      value: value ?? data.selectedKey,
      onChange: data.onKeySelect,
      updateSelectedButtonRef: onSelectButtonRef,
    },
  };

  return {
    props: {
      ...props,
      accessible: true,
      accessibilityRole: 'radiogroup',
      defaultTabbableElement: selectedButtonRef,
      isCircularNavigation: true,
    },
    state: {
      ...state,
    },
  };
};

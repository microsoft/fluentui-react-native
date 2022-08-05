import * as React from 'react';
import { RadioGroupProps, RadioGroupState, RadioGroupSlotProps } from './RadioGroup.types';
import { useSelectedKey as useValue } from '@fluentui-react-native/interactive-hooks';
import { View } from 'react-native';

export const useRadioGroup = (props: RadioGroupProps): RadioGroupState => {
  const { label, accessibilityLabel, value, defaultValue, ...rest } = props;

  // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
  const data = useValue(value || defaultValue || null, props.onChange);

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

  // const styleProps = useStyling(props, (override: string) => state[override] || props[override]);

  // const slotProps = mergeSettings<RadioGroupSlotProps>(styleProps, {
  //   root: { accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: 'radiogroup', ...rest },
  //   label: { children: label },
  //   container: { isCircularNavigation: true, defaultTabbableElement: selectedButtonRef },
  // });

  // return { slotProps, state };
};

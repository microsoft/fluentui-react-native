/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupName, RadioGroupType, RadioGroupProps } from './RadioGroup.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { stylingSettings } from './RadioGroup.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroup } from './useRadioGroup';
import { RadioGroupProvider } from './radioGroupContext';
import { useRadioGroupContextValue } from './useRadioGroupContextValue';

export const RadioGroup = compose<RadioGroupType>({
  displayName: radioGroupName,
  ...stylingSettings,
  slots: {
    root: View,
    label: View,
    labelText: Text,
    required: Text,
    options: View,
    container: FocusZone,
  },
  useRender: (userProps: RadioGroupProps, useSlots: UseSlots<RadioGroupType>) => {
    const radioGroup = useRadioGroup(userProps);
    const contextValue = useRadioGroupContextValue(radioGroup.state);
    const Slots = useSlots(userProps, (layer) => radioGroup.state[layer] || userProps[layer]);

    return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      if (!radioGroup.state) {
        return null;
      }

      const { label, required, defaultTabbableElement, isCircularNavigation, ...mergedProps } = mergeProps(radioGroup.props, final);

      const labelComponent = (
        <Slots.label>
          <Slots.labelText key="label">{label}</Slots.labelText>
          {!!required && <Slots.required>{'*'}</Slots.required>}
        </Slots.label>
      );

      // Populate the buttonKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        contextValue.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            return child.props.buttonKey;
          }
        });
      }

      return (
        <RadioGroupProvider value={contextValue}>
          <Slots.root {...mergedProps}>
            {label && labelComponent}
            <Slots.container isCircularNavigation defaultTabbableElement={defaultTabbableElement}>
              <Slots.options>{children}</Slots.options>
            </Slots.container>
          </Slots.root>
        </RadioGroupProvider>
      );
    };
  },
});

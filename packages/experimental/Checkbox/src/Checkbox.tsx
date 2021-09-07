/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { checkboxName, CheckboxType, CheckboxProps } from './Checkbox.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Checkbox.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useCheckbox } from './useCheckbox';

export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  ...stylingSettings,
  slots: {
    root: View,
    checkbox: View,
    checkmark: Text,
    content: Text,
  },
  render: (userProps: CheckboxProps, useSlots: UseSlots<CheckboxType>) => {
    const Checkbox = useCheckbox(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, layer => Checkbox.state[layer] || userProps[layer]);
    // now return the handler for finishing render
    return (final: CheckboxProps, ...children: React.ReactNode[]) => {
      const { label, ...mergedProps } = mergeProps(Checkbox.props, final);

      // const boxAtEndStyle = {
      //   marginStart: 4,
      //   marginEnd: 0,
      // };

      return (
        <Slots.root {...mergedProps}>
          {Checkbox.state.boxAtEnd && <Slots.content key="content">{label}</Slots.content>}
          <Slots.checkbox>
            <Slots.checkmark>✓</Slots.checkmark>
          </Slots.checkbox>
          {!Checkbox.state.boxAtEnd && <Slots.content key="content">{label}</Slots.content>}
          {children}
        </Slots.root>
      );
    };
  },
});

export default Checkbox;

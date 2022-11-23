/** @jsx withSlots */
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { checkboxName, CheckboxType, CheckboxProps } from './Checkbox.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings, getDefaultSize } from './Checkbox.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useCheckbox } from './useCheckbox';
import { Svg, Path } from 'react-native-svg';

const unsupportedAndroidProps: string[] = ['size', 'shape', 'required', 'labelPosition', 'tooltip'];

export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    checkbox: View,
    checkmark: Svg,
    label: Text,
    required: Text,
  },
  useRender: (userProps: CheckboxProps, useSlots: UseSlots<CheckboxType>) => {
    // Removal of tokens which are not supported for Android
    {
      Platform.OS === 'android' &&
        unsupportedAndroidProps.map((e) => {
          Reflect.deleteProperty(userProps, e);
        });
    }

    // configure props and state for checkbox based on user props
    const Checkbox = useCheckbox(userProps);
    // grab the styled slots
    const Slots = useSlots(
      userProps,
      (layer) =>
        Checkbox.state[layer] ||
        userProps[layer] ||
        layer === userProps['shape'] ||
        layer === userProps['size'] ||
        (!userProps['size'] && layer === getDefaultSize()),
    );

    // now return the handler for finishing render
    return (final: CheckboxProps) => {
      const { label, required, ...mergedProps } = mergeProps(Checkbox.props, final);
      const labelComponent = (
        <React.Fragment>
          <Slots.label key="label">{label}</Slots.label>
          {!!required && <Slots.required>{typeof required === 'string' ? required : '*'}</Slots.required>}
        </React.Fragment>
      );

      // We want a thicker checkmark in HC to make the checkmark stand out more.
      const checkmarkPath = (
        <Path
          fill="currentColor"
          d="M9.76497 3.20474C10.0661 3.48915 10.0797 3.96383 9.79526 4.26497L5.54526 8.76497C5.40613 8.91228 5.21332 8.99703 5.01071 8.99993C4.8081 9.00282 4.61295 8.92361 4.46967 8.78033L2.21967 6.53033C1.92678 6.23744 1.92678 5.76257 2.21967 5.46967C2.51256 5.17678 2.98744 5.17678 3.28033 5.46967L4.98463 7.17397L8.70474 3.23503C8.98915 2.9339 9.46383 2.92033 9.76497 3.20474Z"
        />
      );

      return (
        <Slots.root {...mergedProps}>
          {Checkbox.state.labelIsBefore && labelComponent}
          <Slots.checkbox>
            <Slots.checkmark key="checkmark" viewBox="0 0 12 12">
              {checkmarkPath}
            </Slots.checkmark>
          </Slots.checkbox>
          {!Checkbox.state.labelIsBefore && labelComponent}
        </Slots.root>
      );
    };
  },
});

export default Checkbox;

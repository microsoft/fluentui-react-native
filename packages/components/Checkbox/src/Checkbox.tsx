/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { checkboxName, CheckboxType, CheckboxProps } from './Checkbox.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings, getDefaultSize } from './Checkbox.styling';
import { compose, mergeProps, withSlots, UseSlots, useFluentTheme } from '@fluentui-react-native/framework';
import { useCheckbox } from './useCheckbox';
import { Svg, Path } from 'react-native-svg';
import { shouldUseThickCheckmark } from './shouldUseThickCheckmark';

export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  ...stylingSettings,
  slots: {
    root: View,
    checkbox: View,
    checkmark: Svg,
    label: Text,
    required: Text,
  },
  useRender: (userProps: CheckboxProps, useSlots: UseSlots<CheckboxType>) => {
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
    const thickCheckmark = shouldUseThickCheckmark(useFluentTheme());

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
      const checkmarkPath = thickCheckmark ? (
        <Path
          fill="currentColor"
          d="M10.2637 1.26367L4 7.5332L0.736328 4.26367L1.26367 3.73633L4 6.4668L9.73633 0.736328L10.2637 1.26367Z"
          stroke="currentColor"
          strokeWidth="1"
        />
      ) : (
        <Path
          fill="currentColor"
          d="M10.2637 1.26367L4 7.5332L0.736328 4.26367L1.26367 3.73633L4 6.4668L9.73633 0.736328L10.2637 1.26367Z"
        />
      );

      return (
        <Slots.root {...mergedProps}>
          {Checkbox.state.labelIsBefore && labelComponent}
          <Slots.checkbox>
            <Slots.checkmark key="checkmark" viewBox="0 0 11 8">
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

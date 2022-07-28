/** @jsx withSlots */
import * as React from 'react';
import { View, Text } from 'react-native';
import { switchName, SwitchType, SwitchState, SwitchProps } from './Switch.types';
// import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Switch.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useSwitch } from './useSwitch';
// import { ViewWin32 } from '@office-iss/react-native-win32';
/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
export const switchLookup = (layer: string, state: SwitchState, userProps: SwitchProps): boolean => {
  return state[layer] || userProps[layer] || (layer === 'hovered' && state[layer]);
};

export const Switch = compose<SwitchType>({
  displayName: switchName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    track: View,
    thumb: View,
  },
  useRender: (userProps: SwitchProps, useSlots: UseSlots<SwitchType>) => {
    const switchInfo = useSwitch(userProps);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, userProps));

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, accessibilityLabel, ...mergedProps } = mergeProps(switchInfo.props, final);

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          <Slots.track>
            <Slots.thumb />
          </Slots.track>
          <Slots.label>{label}</Slots.label>
        </Slots.root>
      );
    };
  },
});

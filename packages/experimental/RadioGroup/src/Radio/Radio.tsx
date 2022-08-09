/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioName, RadioType, RadioProps } from './Radio.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './Radio.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadio } from './useRadio';
import { filterViewProps } from '@fluentui-react-native/adapters';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
// export const radioLookup = (layer: string, state: IPressableState, userProps: RadioProps): boolean => {
//   return state[layer] || userProps[layer];
// };

export const Radio = compose<RadioType>({
  displayName: radioName,
  ...stylingSettings,
  slots: {
    root: View,
    button: View,
    innerCircle: View,
    label: Text,
  },
  filters: {
    button: filterViewProps,
    innerCircle: filterViewProps,
  },
  useRender: (userProps: RadioProps, useSlots: UseSlots<RadioType>) => {
    const radio = useRadio(userProps);
    const Slots = useSlots(userProps, (override: string) => radio.state[override] || radio.props[override]);

    // now return the handler for finishing render
    return (final: RadioProps, ...children: React.ReactNode[]) => {
      const { label, ...mergedProps } = mergeProps(radio.props, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.button>
            <Slots.innerCircle />
          </Slots.button>
          <Slots.label>{label}</Slots.label>
          {children}
        </Slots.root>
      );
    };
  },
});

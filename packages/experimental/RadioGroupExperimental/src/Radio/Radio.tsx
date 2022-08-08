/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioName, RadioType, RadioProps } from './Radio.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings, getDefaultSize } from './Radio.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadio } from './useRadio';
import { IPressableState } from '@fluentui-react-native/interactive-hooks';
import { filterViewProps } from '@fluentui-react-native/adapters';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
export const radioLookup = (layer: string, state: IPressableState, userProps: RadioProps): boolean => {
  return state[layer] || userProps[layer];
};

export const Radio = compose<RadioType>({
  displayName: radioName,
  ...stylingSettings,
  slots: {
    root: View,
    button: { slotType: View, filter: filterViewProps },
    innerCircle: { slotType: View, filter: filterViewProps },
    label: Text,
  },
  useRender: (userProps: RadioProps, useSlots: UseSlots<RadioType>) => {
    const radio = useRadio(userProps);
    const Slots = useSlots(userProps, (layer) => radioLookup(layer, radio.state, userProps));

    // now return the handler for finishing render
    return (final: RadioProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(radio.props, final);

      return (
        <Slots.root>
          <Slots.button>
            <Slots.innerCircle />
          </Slots.button>
          <Slots.label />
          {children}
        </Slots.root>
      );
    };
  },
});

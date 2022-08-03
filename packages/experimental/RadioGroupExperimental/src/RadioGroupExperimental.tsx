/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupExperimental, RadioGroupExperimentalType, RadioGroupExperimentalProps } from './RadioGroupExperimental.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './RadioGroupExperimental.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroupExperimental } from './useRadioGroupExperimental';
/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the radio-group-experimental.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the radio-group-experimental
 * @returns Whether the styles that are assigned to the layer should be applied to the radio-group-experimental
 */
export const radioGroupExperimentalLookup = (layer: string, userProps: RadioGroupExperimentalProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const RadioGroupExperimental = compose<RadioGroupExperimentalType>({
  displayName: radioGroupExperimental,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: RadioGroupExperimentalProps, useSlots: UseSlots<RadioGroupExperimentalType>) => {
    const radioGroupExperimentalProps = useRadioGroupExperimental(userProps);
    const Slots = useSlots(userProps, (layer) => radioGroupExperimentalLookup(layer, userProps));

    return (final: RadioGroupExperimentalProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(radioGroupExperimentalProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});

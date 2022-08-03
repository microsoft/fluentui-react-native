/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupName, RadioGroupType, RadioGroupProps } from './RadioGroup.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { stylingSettings } from './RadioGroup.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroupExperimental } from './useRadioGroup';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the radio-group-experimental.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the RadioGroup
 * @param userProps The props that were passed into the RadioGroup
 * @returns Whether the styles that are assigned to the layer should be applied to the RadioGroup
 */
export const radioGroupLookup = (layer: string, userProps: RadioGroupProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const RadioGroup = compose<RadioGroupType>({
  displayName: radioGroupName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    container: FocusZone,
  },
  useRender: (userProps: RadioGroupProps, useSlots: UseSlots<RadioGroupType>) => {
    const radioGroupExperimentalProps = useRadioGroupExperimental(userProps);
    const Slots = useSlots(userProps, (layer) => radioGroupLookup(layer, userProps));

    return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(radioGroupExperimentalProps, final);

      return (
        <RadioGroupContext.Provider
          // Passes in the selected key and a hook function to update the newly selected button and call the client's onChange callback
          value={renderData.state.context}
        >
          <Slots.root>
            <Slots.label />
            <Slots.container>{children}</Slots.container>
          </Slots.root>
        </RadioGroupContext.Provider>
      );
    };
  },
});

/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupName, RadioGroupType, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { stylingSettings } from './RadioGroup.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroup } from './useRadioGroup';
import { RadioGroupProvider } from './radioGroupContext';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the radio-group-experimental.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the RadioGroup
 * @param userProps The props that were passed into the RadioGroup
 * @returns Whether the styles that are assigned to the layer should be applied to the RadioGroup
 */
export const radioGroupLookup = (layer: string, state: RadioGroupState, userProps: RadioGroupProps): boolean => {
  return state[layer] || userProps[layer] || layer === userProps['textSize'];
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
    const radioGroup = useRadioGroup(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => radioGroupLookup(layer, userProps));
    const contextValue = useRadioGroupContextValue(state);

    return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      const { ...mergedProps } = mergeProps(radioGroup, final);

      if (renderData.state == undefined) {
        return null;
      }

      // Populate the buttonKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        renderData.state.context.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            return child.props.buttonKey;
          }
        });
      }

      return (
        <RadioGroupProvider value={contextValue}>
          <Slots.root>
            {label && <Slots.label />}
            <Slots.container>{children}</Slots.container>
          </Slots.root>
        </RadioGroupProvider>
      );
    };
  },
});

/** @jsx withSlots */
import { Pressable, View } from 'react-native';
import { radioName, RadioType, RadioProps } from './Radio.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './Radio.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadio } from './useRadio';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { PressableState } from '@fluentui-react-native/interactive-hooks';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Radio.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the Radio
 * @param userProps The props that were passed into the Radio
 * @returns Whether the styles that are assigned to the layer should be applied to the Radio
 */
export const radioLookup = (layer: string, state: PressableState, userProps: RadioProps): boolean => {
  return state[layer] || userProps[layer] || (layer === 'labelPositionBelow' && userProps['labelPosition'] === 'below');
};

export const Radio = compose<RadioType>({
  displayName: radioName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    button: View,
    innerCircle: View,
    labelContent: View,
    label: Text,
    subtext: Text,
  },
  filters: {
    button: filterViewProps,
    innerCircle: filterViewProps,
  },
  useRender: (userProps: RadioProps, useSlots: UseSlots<RadioType>) => {
    const radio = useRadio(userProps);
    const Slots = useSlots(userProps, (layer: string) => radioLookup(layer, radio.state, radio.props));

    // now return the handler for finishing render
    return (final: RadioProps) => {
      const { label, subtext, ...mergedProps } = mergeProps(radio.props, final);

      const labelComponent = (
        <Slots.labelContent>
          <Slots.label>{label}</Slots.label>
          {!!subtext && <Slots.subtext>{subtext}</Slots.subtext>}
        </Slots.labelContent>
      );

      return (
        <Slots.root {...mergedProps}>
          <Slots.button>
            <Slots.innerCircle />
          </Slots.button>
          {labelComponent}
        </Slots.root>
      );
    };
  },
});

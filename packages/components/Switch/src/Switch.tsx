/** @jsx withSlots */
import { View, Text } from 'react-native';
import { switchName, SwitchType, SwitchState, SwitchProps } from './Switch.types';
import { stylingSettings } from './Switch.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useSwitch } from './useSwitch';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the switch.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the switch
 * @param userProps The props that were passed into the switch
 * @returns Whether the styles that are assigned to the layer should be applied to the switch
 */
export const switchLookup = (layer: string, state: SwitchState, userProps: SwitchProps): boolean => {
  return state[layer] || userProps[layer] || layer === userProps['labelPosition'];
};

export const Switch = compose<SwitchType>({
  displayName: switchName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    track: View,
    thumb: View,
    toggleContainer: View,
    onOffText: Text,
  },
  useRender: (userProps: SwitchProps, useSlots: UseSlots<SwitchType>) => {
    const switchInfo = useSwitch(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, switchInfo.props));

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, accessibilityLabel, ...mergedProps } = mergeProps(switchInfo.props, final);
      const onOffText = switchInfo.state.toggleOn ? onText : offText;
      const displayOnOffText = !!offText || !!onText;

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer>
            <Slots.track>
              <Slots.thumb />
            </Slots.track>
            {displayOnOffText && <Slots.onOffText>{onOffText}</Slots.onOffText>}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

/** @jsx withSlots */
import * as React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { Text } from '@fluentui-react-native/text';
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
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['labelPosition'] ||
    (state['toggled'] && layer === 'toggleOn') ||
    (!state['toggled'] && layer === 'toggleOff')
  );
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
    const toggleContainerRef = React.useRef(null);
    const switchInfo = useSwitch(userProps);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, switchInfo.props));

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, ...mergedProps } = mergeProps(switchInfo.props, final);
      const offOpacity = switchInfo.state.toggled ? 0 : 1;
      const onOpacity = switchInfo.state.toggled ? 1 : 0;
      const displayOnOffText = !!offText || !!onText;
      const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled;
      const thumbAnimation = isReduceMotionEnabled ? { animationClass: 'Ribbon_SwitchThumb' } : null;

      return (
        <Slots.root {...mergedProps}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer ref={toggleContainerRef}>
            <Slots.track>
              <Slots.thumb {...thumbAnimation} />
            </Slots.track>
            <View>
              {displayOnOffText && (
                <View>
                  <Text style={{ position: 'relative', opacity: onOpacity }}>{onText}</Text>
                  <Text style={{ position: 'absolute', opacity: offOpacity }}>{offText}</Text>
                </View>
              )}
            </View>
            {/* <Text style={{ position: 'absolute', left: 0, opacity: onOpacity }}>???</Text> */}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

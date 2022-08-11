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
    const switchInfo = useSwitch(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, switchInfo.props));
    const { onText, offText } = userProps;
    const [testText, setTestText] = React.useState(null);
    const [finalWidth, setFinalWidth] = React.useState(-1);
    const [textBeingTested, setTextBeingTested] = React.useState('none');

    const onLayout = (event) => {
      const measuredWidth = event.nativeEvent.layout.width;
      if (textBeingTested === 'none') {
        setFinalWidth(-1);
        setTextBeingTested('onText');
        setTestText(onText);
        console.log('A');
      } else if (textBeingTested === 'onText') {
        setFinalWidth(measuredWidth);
        setTextBeingTested('offText');
        setTestText(offText);
      } else if (textBeingTested === 'offText') {
        if (measuredWidth > finalWidth) {
          setFinalWidth(measuredWidth);
        }
        setTextBeingTested('done');
        setTestText(null);
      }
    };

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, ...mergedProps } = mergeProps(switchInfo.props, final);
      const onOffText = switchInfo.state.toggled ? onText : offText;
      const displayOnOffText = !!offText || !!onText;
      const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled;
      const thumbAnimation = isReduceMotionEnabled ? { animationClass: 'Ribbon_SwitchThumb' } : null;
      const currentOpacity = testText ? 0 : 1;
      const newMinWidth = testText ? null : { minWidth: finalWidth };
      return (
        <Slots.root onLayout={onLayout} {...mergedProps} style={[{ opacity: currentOpacity }, newMinWidth]}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer>
            <Slots.track>
              <Slots.thumb {...thumbAnimation} />
            </Slots.track>
            {displayOnOffText && <Slots.onOffText>{testText ? testText : onOffText}</Slots.onOffText>}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

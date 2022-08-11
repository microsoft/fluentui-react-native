/** @jsx withSlots */
import * as React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { switchName, SwitchType, SwitchState, SwitchProps, textBeingTestedStates } from './Switch.types';
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
    const [onOffTextTest, setOnOffTextTest] = React.useState(null);
    const [finalWidth, setFinalWidth] = React.useState<number>(-1);
    const [textBeingTested, setTextBeingTested] = React.useState<textBeingTestedStates>('init');
    const toggleContainerRef = React.useRef(null);

    /*
      Controls the rendering of the onText and offText in order to take measurements of what the minWidth should
      be. Having the correct minWidth prevents the control from "jiggling" when the onText and offText
      are different sizes.
    */
    const measureOnOffTexts = React.useCallback(
      (measuredWidth) => {
        switch (textBeingTested) {
          case 'init':
            setTextBeingTested('onText');
            setOnOffTextTest(onText);
            break;
          case 'onText':
            setFinalWidth(0);
            setTextBeingTested('offText');
            setOnOffTextTest(offText);
            break;
          case 'offText':
            setFinalWidth(measuredWidth);
            setTextBeingTested('done');
            setOnOffTextTest(null);
            break;
          case 'done':
            if (measuredWidth > finalWidth) {
              setFinalWidth(measuredWidth);
            }
            break;
        }
      },
      [textBeingTested, finalWidth, offText, onText],
    );

    // Each time we reach a new stage in the measureOnOffTexts method we take a measurement.
    React.useEffect(() => {
      toggleContainerRef?.current?.measure((_x, _y, width, _height) => {
        measureOnOffTexts(width);
      });
    }, [textBeingTested, measureOnOffTexts]);

    // If the user changes the either the onText or offText props we trigger a re-measurement of the onText and offText.
    React.useEffect(() => {
      if (textBeingTested === 'done') {
        setTextBeingTested('init');
      }
    }, [onText, offText]);

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, ...mergedProps } = mergeProps(switchInfo.props, final);
      const onOffText = switchInfo.state.toggled ? onText : offText;
      const displayOnOffText = !!offText || !!onText;
      const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled;
      const thumbAnimation = isReduceMotionEnabled ? { animationClass: 'Ribbon_SwitchThumb' } : null;
      const currentOpacity = onOffTextTest ? 0 : 1; // hides the control during measurements
      const newMinWidth = onOffTextTest ? null : { minWidth: finalWidth };

      return (
        <Slots.root {...mergedProps} style={[{ opacity: currentOpacity }]}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer ref={toggleContainerRef} style={newMinWidth}>
            <Slots.track>
              <Slots.thumb {...thumbAnimation} />
            </Slots.track>
            {displayOnOffText && <Slots.onOffText>{onOffTextTest ? onOffTextTest : onOffText}</Slots.onOffText>}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

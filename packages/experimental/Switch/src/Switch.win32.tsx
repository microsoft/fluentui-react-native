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
    const [testText, setTestText] = React.useState(null);
    const [finalWidth, setFinalWidth] = React.useState<number>(-1);
    const [textBeingTested, setTextBeingTested] = React.useState<textBeingTestedStates>('none');
    const offTextWidth = React.useRef(-1);
    const onTextWidth = React.useRef(-1);
    const switch_ref = React.useRef(null);
    // const [refVisible, setRefVisible] = useState(false);

    // React.useEffect(()=>{
    //   measureOnOffTexts(-1);
    // },[]);

    React.useEffect(() => {
      // console.log('stage:', textBeingTested);
      switch_ref?.current?.measure((x, y, width, height) => {
        measureOnOffTexts(width);
      });
    }, [textBeingTested]);

    React.useEffect(() => {
      if (textBeingTested === 'done') {
        setTextBeingTested('none');
      }
    }, [onText, offText]);

    const measureOnOffTexts = (measuredWidth) => {
      switch (textBeingTested) {
        case 'none':
          setFinalWidth(-1);
          setTextBeingTested('onText');
          setTestText(onText);
          console.log('A', measuredWidth, finalWidth);
          break;
        case 'onText':
          setFinalWidth(-1);
          onTextWidth.current = measuredWidth;
          setTextBeingTested('offText');
          setTestText(offText);
          console.log('B', measuredWidth, finalWidth);
          break;
        case 'offText':
          if (measuredWidth > finalWidth) {
            setFinalWidth(measuredWidth);
          }
          setTextBeingTested('done');
          setTestText(null);
          console.log('C', measuredWidth, finalWidth);
          offTextWidth.current = measuredWidth;
          break;
        case 'done':
          if (measuredWidth > finalWidth) {
            setFinalWidth(measuredWidth);
          }
          // setFinalWidth(measuredWidth);
          console.log('D', measuredWidth, finalWidth);

          break;
      }
      // console.log('textBeingTested: ', textBeingTested, 'measuredWidth: ', measuredWidth);
    };

    const onLayout = (event) => {
      // measureOnOffTexts(event.nativeEvent.layout.width);
      console.log('layout', event.nativeEvent.layout.width);
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
        <Slots.root {...mergedProps} style={[{ opacity: currentOpacity }]}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer onLayout={onLayout} ref={switch_ref} style={newMinWidth}>
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

/** @jsxImportSource @fluentui-react-native/framework-base */
import type { StyleProp, TextStyle } from 'react-native';
import { View, AccessibilityInfo, Pressable, Animated, Platform } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, memoize, mergeProps } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Switch.styling';
import type { SwitchType, SwitchState, SwitchProps } from './Switch.types';
import { switchName } from './Switch.types';
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
  const onOffTextExists = !!userProps['onText'] || !!userProps['offText'];
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['labelPosition'] ||
    (userProps['labelPosition'] === 'before' && layer === 'beforeContent') ||
    (userProps['labelPosition'] === 'before' && onOffTextExists && layer === 'afterContent') ||
    (userProps['labelPosition'] === 'after' && layer === 'afterContent') ||
    (userProps['labelPosition'] === 'above' && onOffTextExists && layer === 'afterContent') ||
    (state['toggled'] && layer === 'toggleOn') ||
    (!state['toggled'] && layer === 'toggleOff')
  );
};

const isMobile = Platform.OS === 'android' || Platform.OS == 'ios';

export const Switch = compose<SwitchType>({
  displayName: switchName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    label: Text,
    track: Animated.View, // Conversion from View to Animated.View for Animated API to work
    thumb: Animated.View,
    toggleContainer: View,
    onOffTextContainer: View,
    onOffText: Text,
  },
  useRender: (userProps: SwitchProps, useSlots: UseSlots<SwitchType>) => {
    const switchOnSlot = useSlots(userProps, (layer) => switchLookup(layer, { toggled: true, disabled: userProps.disabled }, {}));
    const switchOffSlot = useSlots(userProps, (layer) => switchLookup(layer, { toggled: false, disabled: userProps.disabled }, {}));

    // For Mobile platform we are passing extra data to useSwitch for Animated API
    const switchInfo = useSwitch(
      userProps,
      isMobile && {
        toggleOnBgColor: switchOnSlot.track({}).props.style.backgroundColor,
        toggleOffBgColor: switchOffSlot.track({}).props.style.backgroundColor,
        trackWidth: switchOnSlot.track({}).props.style.width,
        thumbWidth: switchOnSlot.thumb({}).props.style.width,
        thumbMargin: switchOnSlot.thumb({}).props.style.margin,
      },
    );

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, switchInfo.props));

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, ...mergedProps } = mergeProps(switchInfo.props, final);
      const displayOnOffText = !!offText || !!onText;
      const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled;
      const thumbAnimation = isReduceMotionEnabled ? { animationClass: 'Ribbon_SwitchThumb' } : null;

      return (
        <Slots.root {...mergedProps}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer>
            {/* For the Mobile platform the animated styles are applied  */}
            <Slots.track {...(isMobile && { style: switchInfo.props.switchAnimationStyles.trackBackgroundStyle })}>
              <Slots.thumb {...thumbAnimation} {...(isMobile && { style: switchInfo.props.switchAnimationStyles.thumbAnimatedStyle })} />
            </Slots.track>
            {displayOnOffText && (
              /**
               * If the onText and offText are different lengths, this can cause unwanted shifting of the track, if labelPosition = "after",
               * or the label, if labelPosition = "above". We fix this by rendering both texts and setting the height of the text to hide to
               * zero. This way, even when not visible, the hidden text still takes up its width to prevent shifting.
               */
              <Slots.onOffTextContainer>
                <Slots.onOffText style={getOnOffTextStyle('on', switchInfo.state.toggled)}>{onText}</Slots.onOffText>
                <Slots.onOffText style={getOnOffTextStyle('off', switchInfo.state.toggled)}>{offText}</Slots.onOffText>
              </Slots.onOffTextContainer>
            )}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

const onOffTextStyleWorker = (text: 'on' | 'off', isOn: boolean): StyleProp<TextStyle> => ({
  height: (text === 'on' && isOn) || (text === 'off' && !isOn) ? undefined : 0,
});
const getOnOffTextStyle = memoize(onOffTextStyleWorker);

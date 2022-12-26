/** @jsx withSlots */
import { View, AccessibilityInfo, Pressable, Animated, Platform } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { switchName, SwitchType, SwitchState, SwitchProps, IAnimationConfig } from './Switch.types';
import { stylingSettings } from './Switch.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useSwitch } from './useSwitch';
import React from 'react';

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

// Function to change background slowly over time when switch is toggled.
const startTrackBackgroundAnimation = (checked: boolean, animation: Animated.Value) => {
  const toValue = checked ? 0 : 1;
  Animated.timing(animation, {
    toValue,
    duration: 500,
    useNativeDriver: false,
  }).start();
};

// Function to transform the knob over track in animated way when switch is toggled.
const startTrackAnimation = (onInit = false, animationConfig: IAnimationConfig, animation: Animated.Value, toggled: boolean) => {
  Animated.timing(animation, {
    toValue: toggled
      ? animationConfig.trackWidth - (animationConfig.thumbWidth + animationConfig.thumbMargin * 2)
      : onInit
      ? 0
      : -(animationConfig.trackWidth + animationConfig.thumbWidth),
    duration: 300,
    useNativeDriver: false,
  }).start();
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
    onOffText: Text,
  },
  useRender: (userProps: SwitchProps, useSlots: UseSlots<SwitchType>) => {
    const switchOnSlot = useSlots(userProps, (layer) => switchLookup(layer, { toggled: true }, {}));
    const switchOffSlot = useSlots(userProps, (layer) => switchLookup(layer, { toggled: false }, {}));

    const animationConfig: IAnimationConfig = {
      toggleOnBgColor: switchOnSlot.track({}).props.style.backgroundColor,
      toggleOffBgColor: switchOffSlot.track({}).props.style.backgroundColor,
      trackWidth: switchOnSlot.track({}).props.style.width,
      thumbWidth: switchOnSlot.thumb({}).props.style.width,
      thumbMargin: switchOnSlot.thumb({}).props.style.margin,
    };

    const [animation] = React.useState(new Animated.Value(0));
    const [trackBackgroundAnimation] = React.useState(new Animated.Value(0));

    const onChangeWithAnimation = React.useCallback(
      (e: InteractionEvent, checked?: boolean) => {
        userProps.onChange && userProps.onChange(e, checked);
        if (isMobile) {
          if (checked) {
            startTrackBackgroundAnimation(checked, trackBackgroundAnimation);
            startTrackAnimation(false, animationConfig, animation, checked);
          } else {
            startTrackBackgroundAnimation(checked, trackBackgroundAnimation);
            startTrackAnimation(false, animationConfig, animation, checked);
          }
        }
      },
      [userProps.onChange],
    );

    //Setting the initial position of the know on track when page loads.

    // For Mobile platform we are passing extra data to useSwitch for Aninated API
    const switchInfo = useSwitch({ ...userProps, onChange: onChangeWithAnimation });

    const switchAnimationStyles = {
      // transform over toggled on position to toggled off position and vice versa
      thumbAnimatedStyle: {
        transform: [
          {
            translateX: animation,
          },
        ],
      } as any,
      // Interpolate over toggled on color to toggled off color and vice versa
      trackBackgroundStyle: {
        backgroundColor: trackBackgroundAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: switchInfo.state.toggled
            ? [animationConfig.toggleOnBgColor, animationConfig.toggleOnBgColor]
            : [animationConfig.toggleOffBgColor, animationConfig.toggleOffBgColor],
        }),
      } as any,
    };

    // Setting initial postion of the switch using transform
    if (isMobile) {
      if (switchInfo.state.toggled) {
        startTrackAnimation(false, animationConfig, animation, switchInfo.state.toggled);
        startTrackBackgroundAnimation(true, trackBackgroundAnimation);
      } else {
        startTrackAnimation(true, animationConfig, animation, switchInfo.state.toggled);
        startTrackBackgroundAnimation(false, trackBackgroundAnimation);
      }
    }

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => switchLookup(layer, switchInfo.state, switchInfo.props));

    // now return the handler for finishing render
    return (final: SwitchProps) => {
      const { label, offText, onText, labelPosition, ...mergedProps } = mergeProps(switchInfo.props, final);
      const onOffText = switchInfo.state.toggled ? onText : offText;
      const displayOnOffText = !!offText || !!onText;
      const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled;
      const thumbAnimation = isReduceMotionEnabled ? { animationClass: 'Ribbon_SwitchThumb' } : null;
      return (
        <Slots.root {...mergedProps}>
          <Slots.label>{label}</Slots.label>
          <Slots.toggleContainer>
            {/* For the Mobile platform the animated styles are applied  */}
            <Slots.track {...(isMobile && { style: switchAnimationStyles.trackBackgroundStyle })}>
              <Slots.thumb {...thumbAnimation} {...(isMobile && { style: switchAnimationStyles.thumbAnimatedStyle })} />
            </Slots.track>
            {displayOnOffText && <Slots.onOffText>{onOffText}</Slots.onOffText>}
          </Slots.toggleContainer>
        </Slots.root>
      );
    };
  },
});

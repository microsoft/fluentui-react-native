import { useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import type { DrawerV1Props, DrawerV1Info } from './DrawerV1.types';

const { height, width } = Dimensions.get('window');

export const useDrawerV1 = (props: DrawerV1Props): DrawerV1Info => {
  const { onBlur, onFocus, accessibilityLabel, isVisible, position, children, ...rest } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [animatedValue, isVisible]);

  const handleClose = () => {
    props.onClose();
  };

  const handleBackdropPress = () => {
    props.onClose();
  };

  const animatedTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'left' ? [-width * 0.8, 0] : position === 'right' ? [width * 0.8, 0] : [0, 0],
  });

  const animatedTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, height * 0.5],
  });

  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const animatedElevation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const animatedStyle = {
    transform: position === 'left' || position === 'right' ? [{ translateX: animatedTranslateX }] : [{ translateY: animatedTranslateY }],
    elevation: animatedElevation,
  };

  return {
    props: {
      ...pressable.props,
      ...rest,
      handleClose,
      handleBackdropPress,
      animatedElevation,
      animatedStyle,
      animatedOpacity,
      isVisible,
      position,
      children,
    },
    state: { ...pressable.state, text: '' },
  };
};

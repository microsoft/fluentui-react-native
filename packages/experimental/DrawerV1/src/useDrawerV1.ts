import { useRef, useEffect, useState } from 'react';
import { Animated, Dimensions } from 'react-native';

import type { DrawerV1Props, DrawerV1Info } from './DrawerV1.types';

const { height, width } = Dimensions.get('window');

export const useDrawerV1 = (props: DrawerV1Props): DrawerV1Info => {
  const { onBlur, onFocus, accessibilityLabel, visible, position, children, ...rest } = props;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [animatedValue, visible]);

  const onClose = () => {
    props?.onClose && props.onClose();
  };

  const onBackdropClick = () => {
    props?.onBackdropClick && props.onBackdropClick();
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

  const animatedStyle = {
    transform: position === 'left' || position === 'right' ? [{ translateX: animatedTranslateX }] : [{ translateY: animatedTranslateY }],
  };

  return {
    props: {
      ...rest,
      onClose,
      onBackdropClick,
      animatedStyle,
      animatedOpacity,
      position,
      children,
      visible: internalVisible,
    },
    state: { text: '' },
  };
};

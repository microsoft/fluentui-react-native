import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import type { DrawerProps, DrawerInfo } from './Drawer.types';

const { height, width } = Dimensions.get('window');

export const useDrawer = (props: DrawerProps): DrawerInfo => {
  const { onBlur, onFocus, accessibilityLabel, open, drawerPosition = 'left', showHandle = true, children, ...rest } = props;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [internalOpen, setInternalOpen] = useState(open);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  useEffect(() => {
    if (open) {
      setInternalOpen(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      if (isFirstOpen) {
        setIsFirstOpen(false);
      } else {
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setInternalOpen(false);
        });
      }
    }
  }, [animatedValue, open]);

  const onClose = useCallback(
    (e: InteractionEvent) => {
      props?.onClose && props.onClose(e);
    },
    [props?.onClose],
  );

  const onScrimClick = useCallback(
    (e: InteractionEvent) => {
      props?.onScrimClick && props.onScrimClick(e);
    },
    [props?.onScrimClick],
  );

  const animatedTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: drawerPosition === 'left' ? [-width * 0.8, 0] : drawerPosition === 'right' ? [width * 0.8, 0] : [0, 0],
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
    transform:
      drawerPosition === 'left' || drawerPosition === 'right' ? [{ translateX: animatedTranslateX }] : [{ translateY: animatedTranslateY }],
  };

  return {
    props: {
      ...rest,
      onClose,
      onScrimClick,
      animationConfig: {
        animatedOpacity,
        animatedStyle,
      },
      drawerPosition: drawerPosition ?? 'left',
      children,
      showHandle,
      open: internalOpen,
    },
  };
};

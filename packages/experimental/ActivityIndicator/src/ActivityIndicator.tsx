import * as React from 'react';
import { useRef } from 'react';
import { View, Animated, Easing, ViewProps } from 'react-native';

/**
 * let R = big circle radius, from middle of circle to middle of border width = (width - borderRadius) / 2
 * borderRadius only refers to big circle radius
 * D = sqrt(2)/2 * R is distance from center to the middle of end circle
 * Top end circle:
 *   top: R - D - borderRadius
 *     top edge is already 1 borderRadius below the big circle
 *   left: R - D - borderRadius
 *     left edge is already 1 borderRadius to the right
 * Bottom end circle:
 *   top: R + D - 2 * borderRadius
 *     1 borderRadius explained same as top end circle.
 *     Extra borderRadius since bottom end circle is 1 borderRadius below top end circle already.
 *   left: R - D - borderRadius
 *     same explanation as above
 */
// This will be a token later
// radius is from center to halfway border, border is line thickness
export const getActivityIndicatorStyle = (radius: number, border: number) => {
  const xydist = Math.sqrt(2)/2 * radius;

  return {
    semicircle: {
      width: radius*2 + border, // from outside edge of circle on one side to the opposite side
      height: radius*2 + border,
      borderWidth: border,
      borderColor: '#919191',
      borderRadius: radius + border/2,
      borderLeftColor: 'transparent',
    },
    endTop: {
      width: border,
      height: border,
      borderRadius: border/2,
      backgroundColor: '#919191',
      top: radius - xydist - border,
      left: radius - xydist - border,
    },
    endBottom: {
      width: border,
      height: border,
      borderRadius: border/2,
      backgroundColor: '#919191',
      top: radius + xydist - 2*border,
      left: radius - xydist - border,
    }
  }
}


export type ActivityIndicatorProps = ViewProps & {
    animating?: boolean;
    hidesWhenStopped?: boolean;
}
export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  const spinAnimation = useRef(new Animated.Value(0)).current;
  if (props.animating) {
    React.useEffect(() => {
      Animated.loop(
          Animated.timing(spinAnimation, {
            toValue: 359,
            duration: 750,
            useNativeDriver: true,
            easing: Easing.linear
          })
      ).start();
    });
  }
  const interpolateSpin = spinAnimation.interpolate({
    inputRange: [0, 359],
    outputRange: ['0deg', '359deg'],
  });

  // or display: none, but since React Native ActivityIndicator still takes up space when hidden, using opacity
  let hideOpacity = 1;
  if (props.animating == false && props.hidesWhenStopped == true) {
    hideOpacity = 0;
  }
  return (
    <Animated.View style={[getActivityIndicatorStyle(40, 10).semicircle, { transform: [{rotateZ: interpolateSpin}, {perspective: 10}] }, {opacity: hideOpacity}]}>
      <View style={getActivityIndicatorStyle(40, 10).endTop}></View>
      <View style={getActivityIndicatorStyle(40, 10).endBottom}></View>
    </Animated.View>
  )
};

// Default props mimic the React Native ActivityIndicator
ActivityIndicator.defaultProps = {
  animating: true,
  hidesWhenStopped: true
}
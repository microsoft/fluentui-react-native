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
// radius is from center to halfway border, border is line thickness
export const getActivityIndicatorStyle = (radius: number, border: number) => {
  const xydist = (Math.sqrt(2) / 2) * radius;
  // from outside edge of circle on one side to the opposite side
  const totalDiameter = radius * 2 + border;
  // from Figma
  const activityIndicatorColor = '#919191';

  return {
    circleArc: {
      width: totalDiameter,
      height: totalDiameter,
      borderWidth: border,
      borderColor: activityIndicatorColor,
      borderRadius: radius + border / 2,
      borderLeftColor: 'transparent',
    },
    endTop: {
      width: border,
      height: border,
      borderRadius: border / 2,
      backgroundColor: activityIndicatorColor,
      top: radius - xydist - border,
      left: radius - xydist - border,
    },
    endBottom: {
      width: border,
      height: border,
      borderRadius: border / 2,
      backgroundColor: activityIndicatorColor,
      top: radius + xydist - 2 * border,
      left: radius - xydist - border,
    },
  };
};

export type ActivityIndicatorProps = ViewProps & {
  animating?: boolean;
  hidesWhenStopped?: boolean;
};

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  const spinAnimation = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (props.animating) {
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 359,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ).start();
    }
  });
  const interpolateSpin = spinAnimation.interpolate({
    inputRange: [0, 359],
    outputRange: ['0deg', '359deg'],
  });

  // React Native ActivityIndicator still takes up space when hidden, so to perfectly match would use opacity
  // using display: 'none' because screen reader might still read it when hidden with opacity
  // const displayValue = props.animating == false && props.hidesWhenStopped == true ? 'none' : 'flex';

  // just tested opacity with accessibility inspector. It does not read the hidden opacity activity indicator
  const hideOpacity = props.animating == false && props.hidesWhenStopped == true ? 0 : 1;

  const activityIndicatorStyles = getActivityIndicatorStyle(40, 10);
  const rootViewStyle = [
    activityIndicatorStyles.circleArc,
    { transform: [{ rotateZ: interpolateSpin }, { perspective: 10 }] },
    { opacity: hideOpacity },
  ];

  return (
    <Animated.View style={rootViewStyle} accessible={true} accessibilityRole="progressbar" accessibilityState={{ busy: props.animating }}>
      <View style={activityIndicatorStyles.endTop}></View>
      <View style={activityIndicatorStyles.endBottom}></View>
    </Animated.View>
  );
};

// Default props mimic the React Native ActivityIndicator
ActivityIndicator.defaultProps = {
  animating: true,
  hidesWhenStopped: true,
};

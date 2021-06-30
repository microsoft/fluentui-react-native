import * as React from 'react';
import { useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import { compose, mergeProps, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { activityIndicatorName, ActivityIndicatorProps, ActivityIndicatorType } from './ActivityIndicator.types';
import { stylingSettings } from './ActivityIndicator.styling';

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
// easier to just pass full diameter, so from edge of border to other edge of border
// border is line thickness
export const getActivityIndicatorStyle = (diameter: number, border: number, color: string) => {
  // from halfway in border to center
  const radius = (diameter - border) / 2;
  const xydist = (Math.sqrt(2) / 2) * radius;
  // pass in from data
  const activityIndicatorColor = color;

  return {
    circleArc: {
      width: diameter,
      height: diameter,
      borderWidth: border,
      // borderColor: activityIndicatorColor,
      // Separating into each section for android to work
      borderBottomLeftRadius: radius + border / 2,
      borderBottomRightRadius: radius + border / 2,
      borderTopLeftRadius: radius + border / 2,
      borderTopRightRadius: radius + border / 2,
      // borderRadius: radius + border / 2,
      borderLeftColor: 'transparent',
      borderTopColor: activityIndicatorColor,
      borderBottomColor: activityIndicatorColor,
      borderRightColor: activityIndicatorColor,
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

// export type ActivityIndicatorProps = ViewProps & {
//   animating?: boolean;
//   hidesWhenStopped?: boolean;
// };

// export const ActivityIndicator = (props: ActivityIndicatorProps) => {
//   const spinAnimation = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     if (props.animating) {
//       Animated.loop(
//         Animated.timing(spinAnimation, {
//           toValue: 359,
//           duration: 750,
//           useNativeDriver: false,
//           easing: Easing.linear,
//         }),
//       ).start();
//     }
//   });
//   const interpolateSpin = spinAnimation.interpolate({
//     inputRange: [0, 359],
//     outputRange: ['0deg', '359deg'],
//   });

//   // React Native ActivityIndicator still takes up space when hidden, so to perfectly match would use opacity
//   // using display: 'none' because screen reader might still read it when hidden with opacity
//   // const displayValue = props.animating == false && props.hidesWhenStopped == true ? 'none' : 'flex';

//   // just tested opacity with accessibility inspector. It does not read the hidden opacity activity indicator
//   const hideOpacity = props.animating == false && props.hidesWhenStopped == true ? 0 : 1;

//   const activityIndicatorStyles = getActivityIndicatorStyle(40, 10, '#BDBDBD');
//   const rootViewStyle = [
//     activityIndicatorStyles.circleArc,
//     { transform: [{ rotateZ: interpolateSpin }, { perspective: 10 }] },
//     { opacity: hideOpacity },
//   ];

//   return (
//     <Animated.View style={rootViewStyle} accessible={true} accessibilityRole="progressbar" accessibilityState={{ busy: props.animating }}>
//       <View style={activityIndicatorStyles.endTop}></View>
//       <View style={activityIndicatorStyles.endBottom}></View>
//     </Animated.View>
//   );
// };

// // Default props mimic the React Native ActivityIndicator
// ActivityIndicator.defaultProps = {
//   animating: true,
//   hidesWhenStopped: true,
// };

const useStyling = buildUseStyling(stylingSettings);
export const ActivityIndicator = compose<ActivityIndicatorType>({
  displayName: activityIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    end1: View,
    end2: View,
  },
  render: (props: ActivityIndicatorProps /* what user is passing in */, useSlots: UseSlots<ActivityIndicatorType>) => {
    const Slots = useSlots(props);
    const tokens = useStyling(props).root;

    const memoizedActivityIndicatorData = useMemo(
      () => ({
        color: props.color ? props.color : tokens['color'],
        lineThickness: props.lineThickness ? props.lineThickness : tokens['lineThickness'],
        size: props.size ? props.size : tokens['size'],
      }),
      [props.color, props.lineThickness, props.size],
    );

    props.animating = props.animating != undefined ? props.animating : true;
    props.hidesWhenStopped = props.hidesWhenStopped != undefined ? props.hidesWhenStopped : true;

    return (rest: ActivityIndicatorProps) => {
      const { animating, hidesWhenStopped, ...mergedProps } = mergeProps(props, rest);

      const spinAnimation = useRef(new Animated.Value(0)).current;
      useEffect(() => {
        if (animating) {
          Animated.loop(
            Animated.timing(spinAnimation, {
              toValue: 359,
              duration: 750,
              useNativeDriver: false,
              easing: Easing.linear,
            }),
          ).start();
        }
      });
      const interpolateSpin = spinAnimation.interpolate({
        inputRange: [0, 359],
        outputRange: ['0deg', '359deg'],
      });

      const hideOpacity = animating == false && hidesWhenStopped == true ? 0 : 1;

      const activityIndicatorStyles = getActivityIndicatorStyle(
        memoizedActivityIndicatorData.size,
        memoizedActivityIndicatorData.lineThickness,
        memoizedActivityIndicatorData.color,
      );
      const rootViewStyle = [
        activityIndicatorStyles.circleArc,
        { transform: [{ rotateZ: interpolateSpin }, { perspective: 10 }] },
        { opacity: hideOpacity },
      ];

      var test = [];
      // test.push(<Animated.View style={rootViewStyle}></Animated.View>);
      test.push(<View style={activityIndicatorStyles.endTop} />);
      test.push(<View style={activityIndicatorStyles.endBottom} />);

      return (
        <Slots.root>
          <Slots.end1></Slots.end1>
          <Slots.end2></Slots.end2>
          {/* <Animated.View style={rootViewStyle} {...mergedProps}>
            <View style={activityIndicatorStyles.endTop} />
            <View style={activityIndicatorStyles.endBottom} />
          </Animated.View> */}
        </Slots.root>
      );
    };
  },
});

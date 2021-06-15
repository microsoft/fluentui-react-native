import * as React from 'react';
import { useRef } from 'react';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ACTIVITYINDICATOR_TESTPAGE } from './consts';
import { View, StyleSheet, Animated, Easing, ViewProps } from 'react-native';

const radius = 40; // from center to halfway border
const border = 10; // line thickness
const xydist = Math.sqrt(2)/2 * radius;

// let R = big circle radius, from middle of circle to middle of border width = (width - borderRadius) / 2
// borderRadius only refers to big circle radius
// D = sqrt(2)/2 * R is distance from center to the middle of end circle
// Top end circle:
  // top: R - D - borderRadius
    // top edge is already 1 borderRadius below the big circle
  // left: R - D - borderRadius
    // left edge is already 1 borderRadius to the right
// Bottom end circle:
  // top: R + D - 2 * borderRadius
    // 1 borderRadius explained same as top end circle. Extra borderRadius since bottom end circle is 1 borderRadius below top end circle already.
  // left: R - D - borderRadius
    // same explanation as above

const styles = StyleSheet.create({
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
});


export type ActivityIndicatorProps = ViewProps & {
    animating?: boolean;
    hidesWhenStopped?: boolean;
}
const ActivityIndicator = (props: ActivityIndicatorProps) => {
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
    <Animated.View style={[styles.semicircle, { transform: [{rotateZ: interpolateSpin}, {perspective: 10}] }, {opacity: hideOpacity}]}>
      <View style={styles.endTop}></View>
      <View style={styles.endBottom}></View>
    </Animated.View>
  )
};

// Default props mimic the React Native ActivityIndicator
ActivityIndicator.defaultProps = {
  animating: true,
  hidesWhenStopped: true
}

const activityIndicatorTest: React.FunctionComponent<{}> = () => {

  return (
    <Stack style={stackStyle}>
      <Text>No Props</Text>
      <ActivityIndicator />
      <Text>Animating: False, hidesWhenStopped: False</Text>
      <ActivityIndicator animating={false} hidesWhenStopped={false}/>
      <Text>Animating: False</Text>
      <ActivityIndicator animating={false} />
    </Stack>
  );
};


const activityIndicatorSections: TestSection[] = [
  {
    name: 'ActivityIndicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: activityIndicatorTest,
  }
];

export const ActivityIndicatorTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'ActivityIndicator is a visual representation that data is being loaded. It is made by combining a 3/4 circle arc with 2 end circles for rounded edges.';

  return <Test name="ActivityIndicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};
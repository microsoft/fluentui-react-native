import * as React from 'react';
import { useRef } from 'react';
import { Text } from '@fluentui/react-native';
import { Svg, Path } from 'react-native-svg';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle, separatorStackStyle } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ACTIVITYINDICATORSVG_TESTPAGE } from './consts';
import { Animated, Easing, Button } from 'react-native';


const activityIndicatorSvgTest: React.FunctionComponent<{}> = () => {
  const spinAnimation = useRef(new Animated.Value(0)).current;

  const spin = () => {
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue:359,
        duration: 750,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  };
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

  const stop = () => {
    spinAnimation.setValue(0);
  };

  const interpolateSpin = spinAnimation.interpolate({
    inputRange: [0, 359],
    outputRange: ['0deg', '359deg'],
  });

  let AnimatedSvg = Animated.createAnimatedComponent(Svg);
  return (
    <Stack style={stackStyle}>
      <Stack style={[separatorStackStyle, {height: 'auto'}]}>
        <Button title="Start" onPress={spin}/>
        <Button title="Stop" onPress={stop}/>
      </Stack>
      <Text>SVG using Path (Height/Width: 200)</Text>
      <AnimatedSvg width="200" height="200"  style={{transform: [{rotateZ: interpolateSpin}]}}>
        <Path d='M10 100 A90 90 270 1 1 100 190' stroke='orange' strokeWidth='20' strokeLinecap='round'/>
      </AnimatedSvg>

      <Text>Same SVG with Height/Width changed to 130</Text>
      <AnimatedSvg width="130" height="130"  style={{transform: [{rotateZ: interpolateSpin}]}}>
        <Path d='M10 100 A90 90 270 1 1 100 190' stroke='orange' strokeWidth='20' strokeLinecap='round'/>
      </AnimatedSvg>
    </Stack>
  );
};


const activityIndicatorSvgSections: TestSection[] = [
  {
    name: 'ActivityIndicatorSvg',
    testID: ACTIVITYINDICATORSVG_TESTPAGE,
    component: activityIndicatorSvgTest,
  }
];

export const ActivityIndicatorSvgTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'ActivityIndicatorSvg is a visual representation that data is being loaded. It is the same as ActivityIndicator, except it is built using a SVG Path. Because of the difficulty with scaling a SVG, this prototype will most likely not be used.';

  return <Test name="ActivityIndicatorSvg Test" description={description} sections={activityIndicatorSvgSections} status={status}></Test>;
};
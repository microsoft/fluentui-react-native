/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View, Platform, Text } from 'react-native';
import { CounterBadge } from '@fluentui-react-native/badge';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from '../../FluentTester/test-data/test.svg';

export const CounterBadgeTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View>
      <Text>Here should be no Badge:</Text>
      <CounterBadge count={0}></CounterBadge>
      <Text>And here is the Badge with showZero = true</Text>
      <CounterBadge count={0} showZero={true}></CounterBadge>
      <CounterBadge color="informative" count={777}></CounterBadge>
      <CounterBadge color="important" overflowCount={1000} count={777}></CounterBadge>
      <CounterBadge color="danger" overflowCount={1000} count={1500}></CounterBadge>
      <CounterBadge count={13}></CounterBadge>
      <CounterBadge count={13}>CounterBadge</CounterBadge>
      {svgIconsEnabled && <CounterBadge count={17} icon={{ svgSource: svgProps }} iconPosition="after" />}
    </View>
  );
};

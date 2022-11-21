/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View, Platform, Text } from 'react-native';
import { CounterBadge } from '@fluentui-react-native/badge';
import { iconProps } from '../Common/iconExamples';

export const CounterBadgeTest: React.FunctionComponent = () => {
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View>
      <Text>Dot badge</Text>
      <CounterBadge count={13} dot={true}></CounterBadge>
      <CounterBadge count={0} dot={true}></CounterBadge>
      <Text>Here should be no Badge:</Text>
      <CounterBadge count={0}></CounterBadge>
      <Text>And here is the Badge with showZero = true</Text>
      <CounterBadge count={0} showZero={true}></CounterBadge>
      <CounterBadge badgeColor="informative" count={777}></CounterBadge>
      <CounterBadge badgeColor="important" overflowCount={1000} count={777}></CounterBadge>
      <CounterBadge badgeColor="danger" overflowCount={1000} count={1500}></CounterBadge>
      <CounterBadge count={13} />
      {svgIconsEnabled && <CounterBadge count={17} icon={iconProps} iconPosition="after" />}
    </View>
  );
};

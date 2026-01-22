import React from 'react';
import { View, Text } from 'react-native';

import { CounterBadge } from '@fluentui-react-native/badge';

export const CounterBadgeTest: React.FunctionComponent = () => {
  return (
    <View>
      <Text>Dot badge</Text>
      <CounterBadge count={13} dot={true}></CounterBadge>
      <CounterBadge count={0} dot={true}></CounterBadge>
      <Text>Here no Badge is displayed</Text>
      <CounterBadge count={0}></CounterBadge>
      <Text>And here is the Badge with showZero = true</Text>
      <CounterBadge count={0} showZero={true}></CounterBadge>
      <Text>Default counter badge</Text>
      <CounterBadge>Badge</CounterBadge>
      <CounterBadge count={10}></CounterBadge>
      <Text>Overflow sample</Text>
      <CounterBadge count={777}></CounterBadge>
      <CounterBadge overflowCount={1000} count={777}></CounterBadge>
      <Text>List counter badge</Text>
      <CounterBadge list={true}>Badge</CounterBadge>
      <CounterBadge count={10} list={true}></CounterBadge>
      <Text>Overflow sample</Text>
      <CounterBadge count={777} list={true}></CounterBadge>
      <CounterBadge overflowCount={1000} count={777} list={true}></CounterBadge>
    </View>
  );
};

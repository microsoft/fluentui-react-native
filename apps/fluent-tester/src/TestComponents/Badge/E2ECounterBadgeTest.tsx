import { CounterBadge } from '@fluentui-react-native/badge';
import * as React from 'react';
import { View } from 'react-native';
import { COUNTER_BADGE_TEST_COMPONENT, COUNTER_BADGE_SECONDARY_TEST_COMPONENT, COUNTER_BADGE_TERTIARY_COMPONENT } from './consts';

export const E2ECounterBadgeTest: React.FunctionComponent = () => {
  return (
    <View>
      <CounterBadge testID={COUNTER_BADGE_TEST_COMPONENT} count={77} />
      <CounterBadge testID={COUNTER_BADGE_SECONDARY_TEST_COMPONENT} count={100} />
      <CounterBadge testID={COUNTER_BADGE_TERTIARY_COMPONENT} count={0} dot={true} />
    </View>
  );
};

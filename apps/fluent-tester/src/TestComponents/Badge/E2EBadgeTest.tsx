import { Badge } from '@fluentui-react-native/badge';
import * as React from 'react';
import { View } from 'react-native';
import { BADGE_TEST_COMPONENT, BADGE_SECONDARY_TEST_COMPONENT } from './consts';

export const E2EBadgeTest: React.FunctionComponent = () => {
  return (
    <View>
      <Badge testID={BADGE_TEST_COMPONENT} appearance="outline" size="extraLarge" color="success" shape="square">
        Basic Badge
      </Badge>
      <Badge testID={BADGE_SECONDARY_TEST_COMPONENT}>Default Badge</Badge>
    </View>
  );
};

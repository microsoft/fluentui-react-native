import { Badge, PresenceBadge } from '@fluentui-react-native/badge';
import * as React from 'react';
import { View } from 'react-native';
import { testProps } from '../Common/TestProps';
import { BADGE_TEST_COMPONENT, BADGE_SECONDARY_TEST_COMPONENT } from './consts';

export const E2EBadgeTest: React.FunctionComponent = () => {
  return (
    <View>
      <Badge {...testProps(BADGE_TEST_COMPONENT)} appearance="outline" size="extraLarge" badgeColor="success" shape="square">
        Basic Badge
      </Badge>
      <PresenceBadge {...testProps(BADGE_SECONDARY_TEST_COMPONENT)} status="available" outOfOffice={true} />
    </View>
  );
};

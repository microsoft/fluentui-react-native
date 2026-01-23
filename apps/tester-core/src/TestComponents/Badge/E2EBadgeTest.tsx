import * as React from 'react';
import { View } from 'react-native';

import { Badge, PresenceBadge } from '@fluentui-react-native/badge';
import { BADGE_TEST_COMPONENT, BADGE_SECONDARY_TEST_COMPONENT } from '@fluentui-react-native/e2e-testing';

import { testProps } from '../Common/TestProps';

export const E2EBadgeTest: React.FunctionComponent = () => {
  return (
    <View>
      <Badge
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(BADGE_TEST_COMPONENT)}
        appearance="outline"
        size="extraLarge"
        badgeColor="success"
        shape="square"
      >
        Basic Badge
      </Badge>
      <PresenceBadge
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(BADGE_SECONDARY_TEST_COMPONENT)}
        status="available"
        outOfOffice={true}
      />
    </View>
  );
};

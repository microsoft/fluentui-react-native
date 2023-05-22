import * as React from 'react';
import { View } from 'react-native';

import { Badge, PresenceBadge } from '@fluentui-react-native/badge';
import { Text } from '@fluentui-react-native/text';

import {
  BADGE_TEST_COMPONENT,
  BADGE_SECONDARY_TEST_COMPONENT,
  BADGE_END_TEXT,
  BADGE_START_TEXT,
  BADGE_TEXT,
} from '../../../../E2E/src/Badge/consts';
import { testProps } from '../Common/TestProps';

export const E2EBadgeTest: React.FunctionComponent = () => {
  const [text, setText] = React.useState<string>(BADGE_START_TEXT);
  return (
    <View>
      {text ? <Text {...testProps(BADGE_TEXT)}>{text}</Text> : null}
      <Badge
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(BADGE_TEST_COMPONENT)}
        badgeColor="success"
        shape="square"
        showCloseIcon
        onSelectionChange={(_e, isSelected) => setText(isSelected ? BADGE_END_TEXT : BADGE_START_TEXT)}
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

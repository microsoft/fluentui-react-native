import * as React from 'react';
import { View } from 'react-native';

import { Avatar } from '@fluentui-react-native/avatar';
import {
  AVATAR_ACCESSIBILITY_HINT,
  AVATAR_ACCESSIBILITY_LABEL,
  AVATAR_ACCESSIBILITY_ROLE,
  AVATAR_SECONDARY_TEST_COMPONENT,
  AVATAR_TEST_COMPONENT,
} from '@fluentui-react-native/e2e-testing';

import { testProps } from '../Common/TestProps';

export const E2EAvatarTest: React.FunctionComponent = () => {
  return (
    <View>
      <Avatar
        accessibilityHint={AVATAR_ACCESSIBILITY_HINT}
        accessibilityLabel={AVATAR_ACCESSIBILITY_LABEL}
        accessibilityRole={AVATAR_ACCESSIBILITY_ROLE}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(AVATAR_TEST_COMPONENT)}
      />
      <Avatar
        name="Richard"
        badge={{ status: 'available' }}
        avatarColor={'colorful'}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(AVATAR_SECONDARY_TEST_COMPONENT)}
      />
    </View>
  );
};

import { Avatar } from '@fluentui-react-native/avatar';
import * as React from 'react';
import { View } from 'react-native';
import { testProps } from '../Common/TestProps';
import {
  AVATAR_ACCESSIBILITY_LABEL,
  AVATAR_ACCESSIBILITY_HINT,
  AVATAR_ACCESSIBILITY_ROLE,
  AVATAR_TEST_COMPONENT,
  AVATAR_SECONDARY_TEST_COMPONENT,
} from './consts';

export const E2EAvatarTest: React.FunctionComponent = () => {
  return (
    <View>
      <Avatar
        accessibilityHint={AVATAR_ACCESSIBILITY_HINT}
        accessibilityLabel={AVATAR_ACCESSIBILITY_LABEL}
        accessibilityRole={AVATAR_ACCESSIBILITY_ROLE}
        {...testProps(AVATAR_TEST_COMPONENT)}
      />
      <Avatar name="Richard" badge={{ status: 'available' }} {...testProps(AVATAR_SECONDARY_TEST_COMPONENT)} />
    </View>
  );
};

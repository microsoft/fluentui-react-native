import { Avatar } from '@fluentui-react-native/experimental-avatar';
import * as React from 'react';
import { View } from 'react-native';
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
        testID={AVATAR_TEST_COMPONENT}
        accessibilityHint={AVATAR_ACCESSIBILITY_HINT}
        accessibilityLabel={AVATAR_ACCESSIBILITY_LABEL}
        accessibilityRole={AVATAR_ACCESSIBILITY_ROLE}
      />
      <Avatar testID={AVATAR_SECONDARY_TEST_COMPONENT} name="Richard" badge={{ status: 'available' }} />
    </View>
  );
};

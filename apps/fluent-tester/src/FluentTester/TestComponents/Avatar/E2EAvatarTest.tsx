import { JSAvatar } from '@fluentui-react-native/experimental-avatar';
import * as React from 'react';
import { View } from 'react-native';
import {
  JSAVATAR_ACCESSIBILITY_LABEL,
  JSAVATAR_ACCESSIBILITY_HINT,
  JSAVATAR_ACCESSIBILITY_ROLE,
  AVATAR_TEST_COMPONENT,
  AVATAR_SECONDARY_TEST_COMPONENT,
} from './consts';

export const E2EAvatarTest: React.FunctionComponent = () => {
  return (
    <View>
      <JSAvatar
        testID={AVATAR_TEST_COMPONENT}
        accessibilityHint={JSAVATAR_ACCESSIBILITY_HINT}
        accessibilityLabel={JSAVATAR_ACCESSIBILITY_LABEL}
        accessibilityRole={JSAVATAR_ACCESSIBILITY_ROLE}
      />
      <JSAvatar testID={AVATAR_SECONDARY_TEST_COMPONENT} name="Richard" badge={{ status: 'available' }} />
    </View>
  );
};

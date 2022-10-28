import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_TEXT_TEST_COMPONENT,
  EXPERIMENTAL_TEXT_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_TEXT_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_TEXT_TEST_COMPONENT_LABEL,
} from './consts';

export const E2EExperimentalTextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          testID={EXPERIMENTAL_TEXT_TEST_COMPONENT}
          accessibilityLabel={EXPERIMENTAL_TEXT_ACCESSIBILITY_LABEL}
        >
          Testing Text Component - AccessibilityLabel Set
        </Text>
        <Text variant="captionStandard" testID={EXPERIMENTAL_TEXT_NO_A11Y_LABEL_COMPONENT}>
          {EXPERIMENTAL_TEXT_TEST_COMPONENT_LABEL}
        </Text>
      </Stack>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_TEXT_TEST_COMPONENT,
  EXPERIMENTAL_TEXT_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_TEXT_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_TEXT_CONTENT,
} from './consts';
import { testProps } from '../Common/TestProps';

export const E2EExperimentalTextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          accessibilityLabel={EXPERIMENTAL_TEXT_ACCESSIBILITY_LABEL}
          {...testProps(EXPERIMENTAL_TEXT_TEST_COMPONENT)}
        >
          Testing Text Component - Accessibility Label Set
        </Text>
        <Text variant="captionStandard" {...testProps(EXPERIMENTAL_TEXT_NO_A11Y_LABEL_COMPONENT)}>
          {EXPERIMENTAL_TEXT_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

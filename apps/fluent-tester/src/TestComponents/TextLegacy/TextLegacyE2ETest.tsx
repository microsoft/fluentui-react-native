import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui/react-native';
import {
  DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
  DEPRECATED_TEXT_FIRST_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const TextLegacyE2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          accessibilityLabel={DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(DEPRECATED_TEXT_FIRST_COMPONENT)}
        >
          Testing Deprecated Text Component - Accessibility Label Set
        </Text>
        <Text
          variant="captionStandard"
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(DEPRECATED_TEXT_SECOND_COMPONENT)}
        >
          {DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

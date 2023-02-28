import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';

import {
  TEXTV1_TEST_COMPONENT,
  TEXTV1_ACCESSIBILITY_LABEL,
  TEXTV1_NO_A11Y_LABEL_COMPONENT,
  TEXTV1_CONTENT,
} from '../../../../E2E/src/TextV1/consts';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const TextV1E2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          accessibilityLabel={TEXTV1_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TEXTV1_TEST_COMPONENT)}
        >
          Testing Text Component - Accessibility Label Set
        </Text>
        <Text
          variant="captionStandard"
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TEXTV1_NO_A11Y_LABEL_COMPONENT)}
        >
          {TEXTV1_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  TEXTV1_TEST_COMPONENT,
  TEXTV1_ACCESSIBILITY_LABEL,
  TEXTV1_NO_A11Y_LABEL_COMPONENT,
  TEXTV1_CONTENT,
} from '../../../../E2E/src/TextV1/consts';

export const E2EExperimentalTextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant="captionStandard" testID={TEXTV1_TEST_COMPONENT} accessibilityLabel={TEXTV1_ACCESSIBILITY_LABEL}>
          Testing Text Component - Accessibility Label Set
        </Text>
        <Text variant="captionStandard" testID={TEXTV1_NO_A11Y_LABEL_COMPONENT}>
          {TEXTV1_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

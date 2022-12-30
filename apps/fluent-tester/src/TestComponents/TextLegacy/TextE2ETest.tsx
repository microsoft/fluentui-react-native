import * as React from 'react';
import { View } from 'react-native';
import { TextV1 as Text, Text as DeprecatedText } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
  DEPRECATED_TEXT_FIRST_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
  V1_TEXT_FIRST_ACCESSIBILITY_LABEL,
  V1_TEXT_FIRST_COMPONENT,
  V1_TEXT_SECOND_COMPONENT,
  V1_TEXT_SECOND_COMPONENT_CONTENT,
} from '../../../../E2E/src/TextLegacy/consts';

export const E2ETextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant="captionStandard" testID={V1_TEXT_FIRST_COMPONENT} accessibilityLabel={V1_TEXT_FIRST_ACCESSIBILITY_LABEL}>
          Testing Text Component - Accessibility Label Set
        </Text>
        <Text variant="captionStandard" testID={V1_TEXT_SECOND_COMPONENT}>
          {V1_TEXT_SECOND_COMPONENT_CONTENT}
        </Text>
      </Stack>
      <Stack style={stackStyle} gap={5}>
        <DeprecatedText
          variant="captionStandard"
          testID={DEPRECATED_TEXT_FIRST_COMPONENT}
          accessibilityLabel={DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL}
        >
          Testing Deprecated Text Component - Accessibility Label Set
        </DeprecatedText>
        <DeprecatedText variant="captionStandard" testID={DEPRECATED_TEXT_SECOND_COMPONENT}>
          {DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT}
        </DeprecatedText>
      </Stack>
    </View>
  );
};

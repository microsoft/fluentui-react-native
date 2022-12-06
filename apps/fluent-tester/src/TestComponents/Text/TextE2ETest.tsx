import * as React from 'react';
import { View } from 'react-native';
import { TextV1 as Text, Text as DeprecatedText } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  FIRST_TEXT_COMPONENT,
  TEXT_ACCESSIBILITY_LABEL,
  SECOND_TEXT_COMPONENT,
  TEXT_COMPONENT_CONTENT,
  THIRD_TEXT_COMPONENT,
  DEPRECATED_TEXT_ACCESSIBILITY_LABEL,
  FOURTH_TEXT_COMPONENT,
  DEPRECATED_TEXT_COMPONENT_CONTENT,
} from './consts';

export const E2ETextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant="captionStandard" testID={FIRST_TEXT_COMPONENT} accessibilityLabel={TEXT_ACCESSIBILITY_LABEL}>
          Testing Text Component - Accessibility Label Set
        </Text>
        <Text variant="captionStandard" testID={SECOND_TEXT_COMPONENT}>
          {TEXT_COMPONENT_CONTENT}
        </Text>
      </Stack>
      <Stack style={stackStyle} gap={5}>
        <DeprecatedText variant="captionStandard" testID={THIRD_TEXT_COMPONENT} accessibilityLabel={DEPRECATED_TEXT_ACCESSIBILITY_LABEL}>
          Testing Deprecated Text Component - Accessibility Label Set
        </DeprecatedText>
        <DeprecatedText variant="captionStandard" testID={FOURTH_TEXT_COMPONENT}>
          {DEPRECATED_TEXT_COMPONENT_CONTENT}
        </DeprecatedText>
      </Stack>
    </View>
  );
};

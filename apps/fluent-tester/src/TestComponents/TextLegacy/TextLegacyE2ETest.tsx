import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
  DEPRECATED_TEXT_FIRST_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
} from '../../../../E2E/src/TextLegacy/consts';

export const E2ETextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          testID={DEPRECATED_TEXT_FIRST_COMPONENT}
          accessibilityLabel={DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL}
        >
          Testing Deprecated Text Component - Accessibility Label Set
        </Text>
        <Text variant="captionStandard" testID={DEPRECATED_TEXT_SECOND_COMPONENT}>
          {DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

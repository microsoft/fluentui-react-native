import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { FIRST_TEXT_COMPONENT, TEXT_ACCESSIBILITY_LABEL, SECOND_TEXT_COMPONENT, TEXT_COMPONENT_CONTENT } from './consts';

export const E2ETextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant="captionStandard" testID={FIRST_TEXT_COMPONENT} accessibilityLabel={TEXT_ACCESSIBILITY_LABEL}>
          Testing Text Component - AccessibilityLabel Set
        </Text>
        <Text variant="captionStandard" testID={SECOND_TEXT_COMPONENT}>
          {TEXT_COMPONENT_CONTENT}
        </Text>
      </Stack>
    </View>
  );
};

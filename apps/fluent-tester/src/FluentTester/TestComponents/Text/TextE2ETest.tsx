import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { TEXT_TEST_COMPONENT, TEXT_ACCESSIBILITY_LABEL, TEXT_NO_A11Y_LABEL_COMPONENT, TEXT_TEST_COMPONENT_LABEL } from './consts';

export const E2ETextTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant="captionStandard" testID={TEXT_TEST_COMPONENT} accessibilityLabel={TEXT_ACCESSIBILITY_LABEL}>
          Testing Text Component - AccessibilityLabel Set
        </Text>
        <Text variant="captionStandard" testID={TEXT_NO_A11Y_LABEL_COMPONENT}>
          {TEXT_TEST_COMPONENT_LABEL}
        </Text>
      </Stack>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';
import { FocusTrapZone, Text } from '@fluentui/react-native';
import { ComponentTwiddler } from './FocusTrapZoneTest';
import { FOCUSTRAPZONE_TEST_COMPONENT, FOCUSTRAPZONE_ACCESSIBILITY_LABEL, FOCUSTRAPZONE_NO_A11Y_LABEL_COMPONENT } from './consts';

export const E2EFocusTrapZoneTest: React.FunctionComponent = () => {
  return (
    <View>
      <Text> FocusTrapZone with Accessibility Label </Text>
      <FocusTrapZone testID={FOCUSTRAPZONE_TEST_COMPONENT} accessibilityLabel={FOCUSTRAPZONE_ACCESSIBILITY_LABEL}>
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
      </FocusTrapZone>
      <Text> FocusTrapZone without Accessibility Label </Text>
      <FocusTrapZone testID={FOCUSTRAPZONE_NO_A11Y_LABEL_COMPONENT}>
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
        <ComponentTwiddler label="trapped" />
      </FocusTrapZone>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@fluentui/react-native';
import {
  BUTTON_TEST_COMPONENT_DEPRECATED,
  BUTTON_ON_PRESS_DEPRECATED,
  BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED,
  BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
  BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../../Common/styles';
import { testProps } from '../../Common/TestProps';

export const E2EButtonTest_deprecated: React.FunctionComponent = () => {
  const [buttonPressed, setButtonPressed] = React.useState(false);

  const onClick = React.useCallback(() => {
    setButtonPressed(!buttonPressed);
  }, [buttonPressed]);

  return (
    <View>
      <Stack style={stackStyle}>
        <Button
          content="This is a button for E2E testing"
          onClick={onClick}
          accessibilityLabel={BUTTON_ACCESSIBILITY_LABEL_DEPRECATED}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(BUTTON_TEST_COMPONENT_DEPRECATED)}
        />
        <Button
          content={BUTTON_TEST_COMPONENT_LABEL_DEPRECATED}
          onClick={onClick}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED)}
        />
        {buttonPressed ? (
          <Text
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(BUTTON_ON_PRESS_DEPRECATED)}
          >
            Button Pressed
          </Text>
        ) : null}
      </Stack>
    </View>
  );
};

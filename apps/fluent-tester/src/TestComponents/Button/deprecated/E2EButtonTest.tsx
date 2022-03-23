/* eslint-disable @typescript-eslint/no-var-requires */
import { Button, Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../../Common/styles';
import {
  BUTTON_TEST_COMPONENT_DEPRECATED,
  BUTTON_ON_PRESS_DEPRECATED,
  BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED,
  BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
  BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
} from '../consts';

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
          testID={BUTTON_TEST_COMPONENT_DEPRECATED}
          onClick={onClick}
          accessibilityLabel={BUTTON_ACCESSIBILITY_LABEL_DEPRECATED}
        />
        <Button content={BUTTON_TEST_COMPONENT_LABEL_DEPRECATED} testID={BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED} onClick={onClick} />
        {buttonPressed ? <Text testID={BUTTON_ON_PRESS_DEPRECATED}>Button Pressed</Text> : null}
      </Stack>
    </View>
  );
};

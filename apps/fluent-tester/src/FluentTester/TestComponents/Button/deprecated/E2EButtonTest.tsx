/* eslint-disable @typescript-eslint/no-var-requires */
import { Button, Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../../Common/styles';
import {
  BUTTON_TEST_COMPONENT,
  BUTTON_ON_PRESS,
  BUTTON_NO_A11Y_LABEL_COMPONENT,
  BUTTON_ACCESSIBILITY_LABEL,
  BUTTON_TEST_COMPONENT_LABEL,
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
          testID={BUTTON_TEST_COMPONENT}
          onClick={onClick}
          accessibilityLabel={BUTTON_ACCESSIBILITY_LABEL}
        />
        <Button content={BUTTON_TEST_COMPONENT_LABEL} testID={BUTTON_NO_A11Y_LABEL_COMPONENT} onClick={onClick} />
        {buttonPressed ? <Text testID={BUTTON_ON_PRESS}>Button Pressed</Text> : null}
      </Stack>
    </View>
  );
};

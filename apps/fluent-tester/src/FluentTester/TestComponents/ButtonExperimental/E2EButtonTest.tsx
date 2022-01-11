/* eslint-disable @typescript-eslint/no-var-requires */
import { Text } from '@fluentui/react-native';
import { Button } from '@fluentui-react-native/experimental-button';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  BUTTONEXPERIMENTAL_TEST_COMPONENT,
  BUTTONEXPERIMENTAL_ON_PRESS,
  BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT,
  BUTTONEXPERIMENTAL_ACCESSIBILITY_LABEL,
  BUTTONEXPERIMENTAL_TEST_COMPONENT_LABEL,
} from './consts';

export const E2EButtonExperimentalTest: React.FunctionComponent = () => {
  const [buttonPressed, setButtonPressed] = React.useState(false);

  const onClick = React.useCallback(() => {
    setButtonPressed(!buttonPressed);
  }, [buttonPressed]);

  return (
    <View>
      <Stack style={stackStyle}>
        <Button testID={BUTTONEXPERIMENTAL_TEST_COMPONENT} onClick={onClick} accessibilityLabel={BUTTONEXPERIMENTAL_ACCESSIBILITY_LABEL}>
          This is a button for E2E testing
        </Button>
        <Button testID={BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT} onClick={onClick}>
          {BUTTONEXPERIMENTAL_TEST_COMPONENT_LABEL}
        </Button>
        {buttonPressed ? <Text testID={BUTTONEXPERIMENTAL_ON_PRESS}>Button Pressed</Text> : null}
      </Stack>
    </View>
  );
};

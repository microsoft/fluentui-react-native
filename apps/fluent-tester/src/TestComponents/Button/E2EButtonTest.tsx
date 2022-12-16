/* eslint-disable @typescript-eslint/no-var-requires */
import { Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  BUTTON_TEST_COMPONENT,
  BUTTON_ON_PRESS,
  BUTTON_NO_A11Y_LABEL_COMPONENT,
  BUTTON_ACCESSIBILITY_LABEL,
  BUTTON_TEST_COMPONENT_LABEL,
  BUTTON_ON_KEY,
  BUTTON_PRESS_TEST_COMPONENT,
  BUTTON_PRESS_TEST_COMPONENT_LABEL,
  BUTTON_FOCUSABLE_TEST_COMPONENT,
  BUTTON_FOCUSABLE_TEST_COMPONENT_LABEL,
} from './consts';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { testProps } from '../Common/TestProps';

export const E2EButtonExperimentalTest: React.FunctionComponent = () => {
  const [buttonPressed, setButtonPressed] = React.useState(false);
  const [keyDetected, setKeyDetected] = React.useState('');

  const onClick = React.useCallback(() => {
    setButtonPressed(!buttonPressed);
    setKeyDetected('');
  }, [buttonPressed]);

  const keyPressProps: Omit<IViewWin32Props, 'accessibilityRole' | 'onBlur' | 'onFocus'> = {
    keyDownEvents: [{ key: 'a' }],
    onKeyDown: (args) => {
      if (args.nativeEvent.key === 'a') {
        setKeyDetected('a (down)');
        args.stopPropagation();
      }
    },
    keyUpEvents: [{ key: 'b' }],
    onKeyUp: (args) => {
      if (args.nativeEvent.key === 'b') {
        setKeyDetected('b (up)');
        args.stopPropagation();
      }
    },
  };

  return (
    <View>
      <Stack style={stackStyle}>
        <Button onClick={onClick} accessibilityLabel={BUTTON_ACCESSIBILITY_LABEL} {...testProps(BUTTON_TEST_COMPONENT)}>
          This is a button for E2E testing
        </Button>
        <Button onClick={onClick} {...testProps(BUTTON_NO_A11Y_LABEL_COMPONENT)}>
          {BUTTON_TEST_COMPONENT_LABEL}
        </Button>
        <Button
          onClick={onClick}
          accessibilityLabel={BUTTON_PRESS_TEST_COMPONENT_LABEL}
          {...keyPressProps}
          {...testProps(BUTTON_PRESS_TEST_COMPONENT)}
        >
          Press &quot;a&quot; or &quot;b&quot; after focusing this button
        </Button>
        <Button
          onClick={onClick}
          accessibilityLabel={BUTTON_FOCUSABLE_TEST_COMPONENT_LABEL}
          focusable={false}
          {...testProps(BUTTON_FOCUSABLE_TEST_COMPONENT)}
        >
          This button isn&apos;t focusable (but isn&apos;t disabled or indeterminate either)
        </Button>
        {buttonPressed ? <Text {...testProps(BUTTON_ON_PRESS)}>Button Pressed</Text> : null}
        {keyDetected ? <Text {...testProps(BUTTON_ON_KEY)}>Button Key Press detected: {keyDetected}</Text> : null}
      </Stack>
    </View>
  );
};

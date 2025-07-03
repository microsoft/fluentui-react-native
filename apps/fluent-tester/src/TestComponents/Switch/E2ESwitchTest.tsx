import * as React from 'react';
import { Platform } from 'react-native';

import {
  SWITCH_TEST_COMPONENT,
  SWITCH_ACCESSIBILITY_LABEL,
  SWITCH_NO_A11Y_LABEL_COMPONENT,
  SWITCH_TEST_COMPONENT_LABEL,
  SWITCH_ON_PRESS,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { TextV1 } from '@fluentui-react-native/text';

import { stackStyle, commonTestStyles } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ESwitchTest: React.FunctionComponent = () => {
  const [switchPressed, setSwitchSwitchPressed] = React.useState(false);

  const memoizedStyles = React.useMemo(
    () => (Platform.OS === 'android' ? { ...commonTestStyles.androidContainer, height: 100, marginBottom: 50 } : stackStyle),
    [],
  );

  const onToggle = React.useCallback(
    (_e, checked) => {
      setSwitchSwitchPressed(checked);
    },
    [setSwitchSwitchPressed],
  );

  return (
    <Stack style={memoizedStyles}>
      <Switch
        label={'Switch Test'}
        onChange={onToggle}
        accessibilityLabel={SWITCH_ACCESSIBILITY_LABEL}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(SWITCH_TEST_COMPONENT)}
      />
      {switchPressed ? (
        <TextV1
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(SWITCH_ON_PRESS)}
        >
          Switch Toggled On
        </TextV1>
      ) : null}
      <Switch
        label={SWITCH_TEST_COMPONENT_LABEL}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(SWITCH_NO_A11Y_LABEL_COMPONENT)}
      />
    </Stack>
  );
};

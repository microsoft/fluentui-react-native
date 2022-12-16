import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { TextV1 } from '@fluentui-react-native/text';
import { stackStyle, commonTestStyles } from '../Common/styles';
import {
  SWITCH_TEST_COMPONENT,
  SWITCH_ACCESSIBILITY_LABEL,
  SWITCH_NO_A11Y_LABEL_COMPONENT,
  SWITCH_TEST_COMPONENT_LABEL,
  SWITCH_ON_PRESS,
} from './consts';
import { Platform } from 'react-native';
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
        {...testProps(SWITCH_TEST_COMPONENT)}
      />
      {switchPressed ? <TextV1 {...testProps(SWITCH_ON_PRESS)}>Switch Toggled On</TextV1> : null}
      <Switch label={SWITCH_TEST_COMPONENT_LABEL} {...testProps(SWITCH_NO_A11Y_LABEL_COMPONENT)} />
    </Stack>
  );
};

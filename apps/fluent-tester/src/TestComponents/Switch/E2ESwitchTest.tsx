import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from '@fluentui-react-native/experimental-text';
import { stackStyle, commonTestStyles } from '../Common/styles';
import {
  SWITCH_TEST_COMPONENT,
  SWITCH_ACCESSIBILITY_LABEL,
  SWITCH_NO_A11Y_LABEL_COMPONENT,
  SWITCH_TEST_COMPONENT_LABEL,
  SWITCH_ON_PRESS,
} from './consts';
import { Platform } from 'react-native';

export const E2ESwitchTest: React.FunctionComponent = () => {
  const [switchPressed, setSwitchSwitchPressed] = React.useState(false);

  const memoizedStyles = React.useMemo(
    () => [Platform.OS === 'android' ? { ...commonTestStyles.androidContainer, height: 100, marginBottom: 50 } : stackStyle],
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
      <Switch testID={SWITCH_TEST_COMPONENT} label={'Switch Test'} onChange={onToggle} accessibilityLabel={SWITCH_ACCESSIBILITY_LABEL} />
      {switchPressed ? <Text testID={SWITCH_ON_PRESS}>Switch Toggled On</Text> : null}
      <Switch label={SWITCH_TEST_COMPONENT_LABEL} testID={SWITCH_NO_A11Y_LABEL_COMPONENT} />
    </Stack>
  );
};

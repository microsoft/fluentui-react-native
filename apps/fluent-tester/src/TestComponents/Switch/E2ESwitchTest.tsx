import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from 'react-native';
import { stackStyle } from '../Common/styles';
import { SWITCH_TEST_COMPONENT, SWITCH_ON_PRESS } from './consts';

export const E2ESwitchTest: React.FunctionComponent = () => {
  const [switchPressed, setSwitchSwitchPressed] = React.useState(false);

  const onToggle = React.useCallback(
    (_e, checked) => {
      setSwitchSwitchPressed(checked);
    },
    [setSwitchSwitchPressed],
  );

  return (
    <Stack style={stackStyle}>
      <Switch testID={SWITCH_TEST_COMPONENT} label={'Switch Test'} onChange={onToggle} />
      {switchPressed ? <Text testID={SWITCH_ON_PRESS}>Switch Toggled On</Text> : null}
    </Stack>
  );
};

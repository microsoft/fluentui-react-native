import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from 'react-native';
import { stackStyle } from '../Common/styles';
import { SWITCH_TEST_COMPONENT, SWITCH_TOGGLE_ON, SWITCH_TOGGLE_OFF } from './consts';

export const E2ESwitchTest: React.FunctionComponent = () => {
  const [showTextChecked, setShowChecked] = React.useState(false);

  const onToggleChecked = (checked: boolean) => {
    setShowChecked(!checked);
  };

  return (
    <Stack style={stackStyle}>
      <Switch testID={SWITCH_TEST_COMPONENT} label={'Checked'} checked={showTextChecked} onChange={onToggleChecked} />
      {showTextChecked && <Text testID={SWITCH_TOGGLE_ON}>Checked Switch toggled to true</Text>}
      {!showTextChecked && <Text testID={SWITCH_TOGGLE_OFF}>Checked Switch toggled to false</Text>}
    </Stack>
  );
};

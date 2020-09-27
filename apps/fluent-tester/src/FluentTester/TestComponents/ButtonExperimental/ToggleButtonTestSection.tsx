import { ToggleButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ToggleButtonTest: React.FunctionComponent<{}> = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <ToggleButton content="Default Toggle" />
      <ToggleButton primary content="Primary Toggle" />
      <ToggleButton ghost content="Ghost Toggle" />
    </View>
  );
};

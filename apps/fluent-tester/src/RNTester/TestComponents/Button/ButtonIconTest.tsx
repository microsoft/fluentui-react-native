import { Button } from '@fluentui-react-native/button';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';

export const ButtonIconTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <Button icon={require('./icon_24x24.png')} content="Button with Icon" tooltip="button tooltip" />
      </Stack>
    </View>
  );
};
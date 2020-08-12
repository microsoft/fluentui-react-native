import { Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Platform, View, Text } from 'react-native';
import { stackStyle } from '../Common/styles';

export const ButtonIconTest: React.FunctionComponent<{}> = () => {
  if (Platform.OS !== ('win32' as any)) {
    return (
      <View>
        <Stack style={stackStyle}>
          <Button icon={require('./icon_24x24.png')} content="Button with Icon" tooltip="button tooltip" />
        </Stack>
      </View>
    );
  } else {
    return (
      <View>
        <Stack style={stackStyle}>
          <Text>Button icon not supported on win32.</Text>
        </Stack>
      </View>
    );
  }
};

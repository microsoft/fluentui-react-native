import * as React from 'react';
import { Alert, Linking, View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';

export const PressableUsage: React.FunctionComponent<{}> = () => {
  const _onPress = (): void => {
    Linking.openURL('https://www.microsoft.com');
  };

  const _onPress2 = (): void => {
    Alert.alert('Alert', 'Success!');
  };

  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text variant={'bodyStandard'}>
          To learn more about microsoft, visit this{' '}
          <Text variant={'bodyStandard'} color="blue" onPress={_onPress}>
            webpage
          </Text>{' '}
          for more details.
        </Text>
        <Text variant={'bodyStandard'}>
          Press{' '}
          <Text variant={'bodyStandard'} color="blue" onPress={_onPress2}>
            here
          </Text>{' '}
          to view an alert.
        </Text>
      </Stack>
    </View>
  );
};

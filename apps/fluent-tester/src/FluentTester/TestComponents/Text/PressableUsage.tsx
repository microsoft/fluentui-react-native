import * as React from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import { IKeyboardEvent, IHandledKeyboardEvent } from '@office-iss/react-native-win32';

export const PressableUsage: React.FunctionComponent<{}> = () => {
  if (Platform.OS == ('win32' as any)) {
    const _onPress = (): void => {
      Linking.openURL('www.microsoft.com');
    };

    const _onKeyDown = (ev: IKeyboardEvent) => {
      if (ev.nativeEvent.key === 'Enter' || ev.nativeEvent.key == 'Space') Linking.openURL('www.microsoft.com');
    };

    const _onPress2 = (): void => {
      Alert.alert('Alert', 'Success!');
    };

    const _onKeyDown2 = (ev: IKeyboardEvent) => {
      if (ev.nativeEvent.key === 'Enter' || ev.nativeEvent.key == ' ') Alert.alert('Alert', 'Success!');
    };

    const handledNativeKeyboardEvents: IHandledKeyboardEvent[] = [{ key: 'Enter' }, { key: 'Space' }];

    return (
      <View>
        <Stack style={stackStyle} gap={5}>
          <Text variant={'bodyStandard'}>
            To learn more about microsoft, visit this{' '}
            <Text
              variant={'bodyStandard'}
              color="blue"
              keyDownEvents={handledNativeKeyboardEvents}
              onPress={_onPress}
              onKeyDown={_onKeyDown}
            >
              webpage
            </Text>{' '}
            for more details.
          </Text>
          <Text variant={'bodyStandard'}>
            Press{' '}
            <Text
              variant={'bodyStandard'}
              color="blue"
              keyDownEvents={handledNativeKeyboardEvents}
              onPress={_onPress2}
              onKeyDown={_onKeyDown2}
            >
              here
            </Text>{' '}
            to view an alert.
          </Text>
        </Stack>
      </View>
    );
  } else {
    return (
      <View>
        <Stack style={stackStyle}>
          <Text>Pressable Text not supported on this platform.</Text>
        </Stack>
      </View>
    );
  }
};

import * as React from 'react';
import * as ReactNative from 'react-native';
import { Stack, Link } from '@fluentui/react-native';
import { Square } from '../Common/Square';
import { stackStyle } from '../Common/styles';

export const LinkTest: React.FunctionComponent<{}> = () => {
  const doPress = (): void => {
    ReactNative.Alert.alert('Alert.', 'You have been alerted.');
  };
  return (
    <Stack style={stackStyle}>
      <Link url="https://www.bing.com/" content="Click to find yourself." />
      <Link onPress={doPress} content="Click to alert yourself." />
      <Link url="https://www.google.com/" disabled content="Click to advertise yourself.">
        <Square />
      </Link>
    </Stack>
  );
};

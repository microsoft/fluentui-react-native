import * as React from 'react';
import * as ReactNative from 'react-native';
import { Stack } from '../components';
import { Link } from '../components/Link/Link';
import { Square } from './Square';
import { stackStyle } from './TesterStyles';

export const LinkTest: React.FunctionComponent<{}> = () => {
  const doPress = (): void => {
    ReactNative.Alert.alert('Alert.', 'You have been alerted.');
  };
  return (
    <Stack style={ stackStyle }>
      <Link url="https://www.bing.com/" content="Click to find yourself." />
      <Link onPress={ doPress } content="Click to alert yourself." />
      <Link url="https://www.google.com/" disabled content="Click to advertise yourself.">
        <Square />
      </Link>
    </Stack>
  );
};

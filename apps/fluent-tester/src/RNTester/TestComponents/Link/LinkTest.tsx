import * as React from 'react';
import { Alert } from 'react-native';
import { Link } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Square } from '../Common/Square';
import { stackStyle } from '../Common/styles';
import { LINK_TESTPAGE } from './../../Consts';

export const LinkTest: React.FunctionComponent<{}> = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };
  return (
    <Stack style={stackStyle}>
      <Link testID={LINK_TESTPAGE} url="https://www.bing.com/" content="Click to find yourself." />
      <Link onPress={doPress} content="Click to alert yourself." />
      <Link url="https://www.google.com/" disabled content="Click to advertise yourself.">
        <Square />
      </Link>
    </Stack>
  );
};

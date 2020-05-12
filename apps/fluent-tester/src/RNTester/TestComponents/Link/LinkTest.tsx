import * as React from 'react';
import { Alert } from 'react-native';
import { Link } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Square } from '../Common/Square';
import { stackStyle } from '../Common/styles';
import { LINK_TESTPAGE } from './../../Consts';
import { Text, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const LinkTest: React.FunctionComponent<{}> = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };
  return (
    <View>
      <Text style={commonStyles.section} testID={LINK_TESTPAGE}>
        Link Test Page
      </Text>
      <Stack style={stackStyle}>
        <Link url="https://www.bing.com/" content="Click to find yourself." />
        <Link onPress={doPress} content="Click to alert yourself." />
        <Link url="https://www.google.com/" disabled content="Click to advertise yourself.">
          <Square />
        </Link>
      </Stack>
    </View>
  );
};

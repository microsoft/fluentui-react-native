import * as React from 'react';
import { Alert } from 'react-native';
import { Shimmer, Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { SHIMMER_TESTPAGE } from './consts';
import { Text, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const ShimmerTest: React.FunctionComponent<{}> = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };
  return (
    <View>
      <Text style={commonStyles.section} testID={SHIMMER_TESTPAGE}>
        Shimmer Test Page
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Shimmer url="https://www.bing.com/" content="Click to navigate." />
        <Shimmer onPress={doPress} content="Click to alert." />
      </Stack>
    </View>
  );
};
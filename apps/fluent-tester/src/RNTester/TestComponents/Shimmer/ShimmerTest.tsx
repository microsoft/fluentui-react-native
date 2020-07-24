import * as React from 'react';
import { Shimmer, Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { SHIMMER_TESTPAGE } from './consts';
import { Text, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const ShimmerTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section} testID={SHIMMER_TESTPAGE}>
        Shimmer Test Page
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Shimmer />
      </Stack>
    </View>
  );
};
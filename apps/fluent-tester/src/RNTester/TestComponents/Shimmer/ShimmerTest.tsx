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
        <Shimmer>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>
        </Shimmer>
      </Stack>
    </View>
  );
};
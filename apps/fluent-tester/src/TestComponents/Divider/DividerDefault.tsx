import { Divider } from '@fluentui-react-native/divider';
import * as React from 'react';
import { View, Text } from 'react-native';

export const DividerDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Divider />
      <Divider text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <Divider textSize="small" />
      <Divider textSize="medium" />
      <Divider textSize="large" />
    </View>
  );
};

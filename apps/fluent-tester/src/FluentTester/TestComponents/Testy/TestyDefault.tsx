import { Testy } from '@fluentui-react-native/testy';
import * as React from 'react';
import { View, Text } from 'react-native';

export const TestyDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Testy />
      <Testy text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <Testy textSize="small" />
      <Testy textSize="medium" />
      <Testy textSize="large" />
    </View>
  );
};

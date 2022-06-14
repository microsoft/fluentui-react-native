//delete?

import { Shadow } from '@fluentui-react-native/Shadow';
import * as React from 'react';
import { View, Text } from 'react-native';

export const ShadowDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Shadow />
      <Shadow text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <Shadow textSize="small" />
      <Shadow textSize="medium" />
      <Shadow textSize="large" />
    </View>
  );
};

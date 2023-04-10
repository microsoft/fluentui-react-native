import { Tooltip } from '@fluentui-react-native/tooltip';
import * as React from 'react';
import { View, Text } from 'react-native';

export const TooltipDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Tooltip />
      <Tooltip text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <Tooltip textSize="small" />
      <Tooltip textSize="medium" />
      <Tooltip textSize="large" />
    </View>
  );
};

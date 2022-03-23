import { ComponentName } from '@fluentui-react-native/component-name';
import * as React from 'react';
import { View, Text } from 'react-native';

export const ComponentNameDefault: React.FunctionComponent = () => {
  return (
    <View>
      <ComponentName />
      <ComponentName text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <ComponentName textSize="small" />
      <ComponentName textSize="medium" />
      <ComponentName textSize="large" />
    </View>
  );
};

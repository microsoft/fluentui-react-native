import { ComponentName } from '@fluentui-react-native/component-name';
import * as React from 'react';
import { View } from 'react-native';

export const ComponentNameDefault: React.FunctionComponent = () => {
  return (
    <View>
      <ComponentName />
      <ComponentName text="This is demo component. Feel free to change" />
    </View>
  );
};

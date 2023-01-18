import { Divider } from '@fluentui-react-native/divider';
import * as React from 'react';
import { View } from 'react-native';

const VerticalDivider = Divider.customize({ minHeight: 100, vertical: true });

export const DividerDefault: React.FunctionComponent = () => {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Divider />
      <VerticalDivider text="Hello World!" alignContent="end" />
      <Divider alignContent="center" text="Goodbye World" />
    </View>
  );
};

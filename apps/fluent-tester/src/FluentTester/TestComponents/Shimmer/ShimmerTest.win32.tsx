import * as React from 'react';
import { View, Text } from 'react-native';

export const ShimmerTest: React.FunctionComponent = () => {
  return (
    <View testID="ScrollViewAreaForComponents">
      <Text>{"Shimmer isn't supported on Win32."}</Text>
    </View>
  );
};

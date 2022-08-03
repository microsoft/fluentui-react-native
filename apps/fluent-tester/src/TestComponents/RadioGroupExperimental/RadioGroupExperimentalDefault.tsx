import { RadioGroupExperimental } from '@fluentui-react-native/radio-group-experimental';
import * as React from 'react';
import { View, Text } from 'react-native';

export const RadioGroupExperimentalDefault: React.FunctionComponent = () => {
  return (
    <View>
      <RadioGroupExperimental />
      <RadioGroupExperimental text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <RadioGroupExperimental textSize="small" />
      <RadioGroupExperimental textSize="medium" />
      <RadioGroupExperimental textSize="large" />
    </View>
  );
};

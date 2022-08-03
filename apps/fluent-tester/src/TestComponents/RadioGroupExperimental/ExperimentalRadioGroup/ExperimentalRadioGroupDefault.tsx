import { ExperimentalRadioGroup } from '@fluentui-react-native/experimental-radio-group';
import * as React from 'react';
import { View, Text } from 'react-native';

export const ExperimentalRadioGroupDefault: React.FunctionComponent = () => {
  return (
    <View>
      <ExperimentalRadioGroup />
      <ExperimentalRadioGroup text="This is demo component. Feel free to change" />
      <Text>Size</Text>
      <ExperimentalRadioGroup textSize="small" />
      <ExperimentalRadioGroup textSize="medium" />
      <ExperimentalRadioGroup textSize="large" />
    </View>
  );
};

import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import * as React from 'react';
import { View } from 'react-native';

export const RequiredRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <View>
      <RadioGroup required label="Required RadioGroup" defaultValue="X" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel="Test Accessibility Label" />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y" value="C" />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup } from 'react-native-uifabric';
// import { RadioButton } from '../../components';
// import { RadioGroup } from '../../components';

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    return;
  };

  return (
    <View>
      <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
    </View>
  );
};

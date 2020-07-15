import * as React from 'react';
import { RadioButton, RadioGroup } from '@fluentui-react-native/radio-group';
import { Separator } from '@fluentui-react-native/separator';
import { View, Text } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { RADIOGROUP_TESTPAGE } from './consts';

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <View>
      <Text style={commonStyles.section} testID={RADIOGROUP_TESTPAGE}>
        Basic RadioGroup Usage
      </Text>
      <Separator />
      <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
    </View>
  );
};
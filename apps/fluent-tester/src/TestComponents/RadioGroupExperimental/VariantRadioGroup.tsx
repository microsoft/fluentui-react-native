import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { Separator } from '@fluentui/react-native';
import * as React from 'react';
import { View, TextInput } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const VariantRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <View>
      <RadioGroup label="RadioGroup with Input" defaultValue="Pear" onChange={onChange}>
        <Radio label="Apple" value="Apple" />
        <Radio label="Pear" value="Pear" />
        <Radio label="Banana" value="Banana" />
        <View>
          <Radio label="" value="Orange" />
          <TextInput
            accessibilityLabel="Other"
            style={commonStyles.textBox}
            placeholder="Other"
            blurOnSubmit={true}
            // onSubmitEditing={(e) => {
            //   setBorderWidth(parseInt(e.nativeEvent.text.toString()));
            // }}
          />
        </View>
      </RadioGroup>
      <Separator />
      <RadioGroup label="RadioGroup with Dropdown" defaultValue="Pear" onChange={onChange}>
        <Radio label="Apple" value="Apple" />
        <Radio label="Pear" value="Pear" />
        <Radio label="Banana" value="Banana" />
        <View>
          <Radio label="Orange" value="Orange" />
        </View>
      </RadioGroup>
    </View>
  );
};

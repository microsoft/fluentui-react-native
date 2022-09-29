import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { Separator } from '@fluentui/react-native';
import * as React from 'react';
import { View, TextInput } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { Option } from '@fluentui-react-native/dropdown';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';

export const VariantRadioGroup: React.FunctionComponent = () => {
  return (
    <View>
      <RadioGroup label="RadioGroup with Input" defaultValue="Pear">
        <Radio label="Apple" value="Apple" />
        <Radio label="Pear" value="Pear" />
        <Radio label="Banana" value="Banana" />
        <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
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
      <RadioGroup label="RadioGroup with Dropdown" defaultValue="Pear">
        <Radio label="Apple" value="Apple" />
        <Radio label="Pear" value="Pear" />
        <Radio label="Banana" value="Banana" />
        <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
          <Radio label="Orange" value="Orange" />
          {/* Replace with V1 Dropdown */}
          <Stack style={stackStyle}>
            <Option>Test</Option>
            <Option disabled>Disabled Test</Option>
          </Stack>
        </View>
      </RadioGroup>
    </View>
  );
};

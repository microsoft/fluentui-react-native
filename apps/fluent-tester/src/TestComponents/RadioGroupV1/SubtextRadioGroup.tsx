import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import * as React from 'react';
import { View } from 'react-native';

export const SubtextRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = React.useCallback((key: string) => {
    console.log(key);
  }, []);

  return (
    <View>
      <RadioGroup label="Select a fruit:" defaultValue="X" onChange={onChange}>
        <Radio label="Apple" subtext="This is a type of fruit" value="W" />
        <Radio label="Pear" subtext="This is a type of fruit" value="X" />
        <Radio label="Banana" subtext="This is a type of fruit" value="C" />
        <Radio label="Tomato" subtext="This is a type of fruit" value="Z" />
      </RadioGroup>
    </View>
  );
};

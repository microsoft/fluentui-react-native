import * as React from 'react';
import { View } from 'react-native';

import { Separator } from '@fluentui/react-native';
import { RadioGroupV1 as RadioGroup, Radio } from '@fluentui-react-native/radio-group';

export const DefaultRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = React.useCallback((key: string) => {
    console.log(key);
  }, []);

  const [selectedKey, setSelectedKey] = React.useState('C');

  const onChange2 = React.useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <View>
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="X" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel="Test Accessibility Label" />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y (disabled)" value="C" disabled={true} />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="Controlled RadioGroup" value={selectedKey} onChange={onChange2}>
        <View>
          <Radio
            label="Option A"
            value="A"
            accessibilityLabel="Test Accessibility Label"
            accessibilityPosInSet={1}
            accessibilitySetSize={4}
          />
          <Radio label="Option B" value="B" accessibilityPosInSet={2} accessibilitySetSize={4} />
          <Radio label="Option C" value="C" accessibilityPosInSet={3} accessibilitySetSize={4} />
          <Radio label="Option D" value="D" accessibilityPosInSet={4} accessibilitySetSize={4} />
        </View>
      </RadioGroup>
    </View>
  );
};

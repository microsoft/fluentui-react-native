import { RadioGroup } from '@fluentui-react-native/experimental-radio-group';
import { RadioButton } from '@fluentui/react-native';
import { Separator } from '@fluentui/react-native';
import * as React from 'react';
import { View } from 'react-native';

export const DefaultRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  const [selectedKey, setSelectedKey] = React.useState('C');

  const onChange2 = React.useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <View>
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="X" onChange={onChange}>
        <RadioButton content="Option W" buttonKey="W" accessibilityLabel="Test Accessibility Label" />
        <RadioButton content="Option X" buttonKey="X" />
        <RadioButton content="Option Y (disabled)" buttonKey="C" disabled={true} />
        <RadioButton content="Option Z" buttonKey="Z" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="Controlled RadioGroup" value={selectedKey} onChange={onChange2}>
        <View>
          <RadioButton
            content="Option A"
            buttonKey="A"
            accessibilityLabel="Test Accessibility Label"
            accessibilityPositionInSet={1}
            accessibilitySetSize={4}
          />
          <RadioButton content="Option B" buttonKey="B" accessibilityPositionInSet={2} accessibilitySetSize={4} />
          <RadioButton content="Option C" buttonKey="C" accessibilityPositionInSet={3} accessibilitySetSize={4} />
          <RadioButton content="Option D" buttonKey="D" accessibilityPositionInSet={4} accessibilitySetSize={4} />
        </View>
      </RadioGroup>
    </View>
  );
};

import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup } from '@fluentui/react-native';

// const BlueRadioButton = RadioButton.customize({ tokens: { borderColor: 'blue' } });
// const BlueRadioButtonBackground = RadioButton.customize({ tokens: { backgroundColor: 'blue' } });
// const BlueRadioButtonTextColor = RadioButton.customize({ tokens: { color: 'blue' } });
// const RadioButtonFontSize = RadioButton.customize({ tokens: { fontSize: 18 } });

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <View>
      <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
        <RadioButton content="Option E" buttonKey="E" />
        <RadioButton content="Option F" buttonKey="F" />
      </RadioGroup>
    </View>
  );
};

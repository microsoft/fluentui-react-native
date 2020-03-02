import * as React from 'react';
import { RadioButton, RadioGroup } from 'react-native-uifabric';

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
      <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
      <RadioButton content="Option B" buttonKey="B" />
      <RadioButton content="Option C" buttonKey="C" disabled={true} />
      <RadioButton content="Option D" buttonKey="D" />
    </RadioGroup>
  );
};

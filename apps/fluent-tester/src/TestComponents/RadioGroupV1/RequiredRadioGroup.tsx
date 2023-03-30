import * as React from 'react';
import { View } from 'react-native';

import { RadioGroupV1 as RadioGroup, Radio } from '@fluentui-react-native/radio-group';

export const RequiredRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = React.useCallback((key: string) => {
    console.log(key);
  }, []);

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

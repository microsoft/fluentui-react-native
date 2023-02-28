import * as React from 'react';
import { View } from 'react-native';

import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';

export const DefaultRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = React.useCallback((key: string) => {
    console.log(key);
  }, []);

  return (
    <View>
      <RadioGroup label="RadioGroup Sample" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel="Test Accessibility Label" />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y" value="Y" />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
    </View>
  );
};

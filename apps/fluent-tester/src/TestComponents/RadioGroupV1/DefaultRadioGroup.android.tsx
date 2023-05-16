import * as React from 'react';
import { View } from 'react-native';

import { RadioGroupV1 as RadioGroup, Radio } from '@fluentui-react-native/radio-group';

export const DefaultRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const [unselectedAccessibilityPrefix, setPrefix] = React.useState<string>('Unselected');
  const onChange = React.useCallback((key: string) => {
    console.log(key);
    if (key == 'W') setPrefix('');
    else setPrefix('Unselected');
  }, []);

  return (
    <View>
      <RadioGroup label="RadioGroup Sample" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel={unselectedAccessibilityPrefix + 'Test Accessibility Label'} />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y" value="Y" />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
    </View>
  );
};

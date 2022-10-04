import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { Separator } from '@fluentui/react-native';
import { Button } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';

export const DisabledRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = React.useCallback((key: string) => {
    console.log(key);
  }, []);

  return (
    <View>
      <Button></Button>
      <RadioGroup disabled label="Disabled RadioGroup" defaultValue="X" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel="Test Accessibility Label" />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y" value="C" />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
      <Button></Button>
      <Separator />
      <RadioGroup label="Disabled Item" defaultValue="X" onChange={onChange}>
        <Radio label="Option W" value="W" accessibilityLabel="Test Accessibility Label" />
        <Radio label="Option X" value="X" />
        <Radio label="Option Y (disabled)" value="C" disabled={true} />
        <Radio label="Option Z" value="Z" />
      </RadioGroup>
    </View>
  );
};

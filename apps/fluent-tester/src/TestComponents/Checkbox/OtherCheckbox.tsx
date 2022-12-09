import * as React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';

export const OtherCheckbox: React.FunctionComponent = () => {
  const [isCheckedControlled1, setCheckedControlled1] = React.useState(false);
  const onChangeControlled1 = React.useCallback((checked) => {
    setCheckedControlled1(checked);
  }, []);

  const [isCheckedControlled2, setCheckedControlled2] = React.useState(true);
  const onChangeControlled2 = React.useCallback((checked) => {
    setCheckedControlled2(checked);
  }, []);

  return (
    <View>
      <Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={Boolean(isCheckedControlled1)} />
      <Checkbox
        label="Checkbox rendered with labelPosition 'before' (controlled)"
        onChange={onChangeControlled2}
        labelPosition="before"
        checked={Boolean(isCheckedControlled2)}
      />
      <Checkbox label="A required checkbox with other required text" required="**" />
    </View>
  );
};

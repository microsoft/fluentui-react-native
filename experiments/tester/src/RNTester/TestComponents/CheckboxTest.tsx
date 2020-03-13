import * as React from 'react';
import { View } from 'react-native';
import { Checkbox } from 'react-native-uifabric';

function onChangeUncontrolled(isChecked: boolean) {
  console.log(isChecked);
}

export const CheckboxTest: React.FunctionComponent<{}> = () => {
  const [isCheckedControlled1, setCheckedControlled1] = React.useState(false);
  const onChangeControlled1 = React.useCallback(checked => {
    setCheckedControlled1(!!checked);
  }, []);

  const [isCheckedControlled2, setCheckedControlled2] = React.useState(false);
  const onChangeControlled2 = React.useCallback(checked => {
    setCheckedControlled2(!!checked);
  }, []);

  return (
    <View>
      <Checkbox label="This is an Uncontrolled Checkbox" onChange={onChangeUncontrolled} defaultChecked={false} ariaLabel="Hello there" />
      <Checkbox label="This is an Uncontrolled Checkbox" onChange={onChangeUncontrolled} defaultChecked={true} />
      <Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={isCheckedControlled1} />
      <Checkbox
        label="This is a controlled Checkbox"
        onChange={onChangeControlled2}
        boxSide="end"
        checked={isCheckedControlled2}
        ariaLabel="Hello there"
      />
    </View>
  );
};

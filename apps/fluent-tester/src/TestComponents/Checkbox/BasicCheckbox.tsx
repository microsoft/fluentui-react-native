import * as React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

function onChangeUncontrolled(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

export const BasicCheckbox: React.FunctionComponent = () => {
  return (
    <View>
      <Checkbox label="Unchecked checkbox (undefined)" onChange={onChangeUncontrolled} />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox label="Checked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked accessibilityLabel="Hello there" />
      <Checkbox label="Disabled checkbox" disabled />
      <Checkbox label="Disabled checked checkbox" defaultChecked disabled />
      <Checkbox label="Checkbox will display a tooltip" tooltip="This is a tooltip" />
      <Checkbox label="A circular checkbox" shape="circular" />
      <Checkbox label="A checkbox with label placed before" labelPosition="before" />
      <Checkbox label="A required checkbox" required />
    </View>
  );
};

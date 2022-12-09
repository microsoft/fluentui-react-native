import * as React from 'react';
import { View } from 'react-native';
import { CheckboxV1 as Checkbox } from '@fluentui-react-native/checkbox';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

function onChangeUncontrolled(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

export const BasicCheckbox = () => {
  return (
    <View>
      <Checkbox label="Unchecked checkbox (undefined)" onChange={onChangeUncontrolled} />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox label="Checked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked accessibilityLabel="Hello there" />
      <Checkbox label="Disabled checkbox" disabled />
      <Checkbox label="Disabled checked checkbox" defaultChecked disabled />
    </View>
  );
};

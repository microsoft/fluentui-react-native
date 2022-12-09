/** @jsx withSlots */
import { checkboxName, CheckboxProps, CheckboxType } from './Checkbox.types';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { Svg } from 'react-native-svg';
import { Text } from '@fluentui-react-native/text';

// GH:935 Remove when SVGs are fixed on windows
export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  slots: { root: View, checkbox: View, checkmark: Svg, label: Text, required: Text },
  useRender: (_props: CheckboxProps, _useSlots: UseSlots<CheckboxType>) => {
    console.warn('Use legacy checkbox for Windows');
    return (_rest: CheckboxProps) => {
      return null;
    };
  },
});
export default Checkbox;

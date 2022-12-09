/** @jsx withSlots */
import { checkboxName, CheckboxTokens, CheckboxProps, CheckboxState } from './Checkbox.types';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { IViewProps } from '@fluentui-react-native/adapters';
import { View } from 'react-native';

interface CheckboxSlotPropsMacOS {
  root: React.PropsWithRef<IViewProps>;
}

interface CheckboxTypeMacOS {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: CheckboxSlotPropsMacOS;
  state: CheckboxState;
}

export const Checkbox = compose<CheckboxTypeMacOS>({
  displayName: checkboxName,
  slots: { root: View },
  useRender: (_props: CheckboxProps, _useSlots: UseSlots<CheckboxTypeMacOS>) => {
    console.warn('Use legacy checkbox or Windows');
    return (_rest: CheckboxProps) => {
      return null;
    };
  },
});
export default Checkbox;

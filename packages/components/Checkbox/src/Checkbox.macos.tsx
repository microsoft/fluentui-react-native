/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';

import type { CheckboxTokens, CheckboxProps, CheckboxState } from './Checkbox.types';
import { checkboxName } from './Checkbox.types';

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
    console.warn('Use deprecated checkbox or experimental-checkbox for MacOS');
    return (_rest: CheckboxProps) => {
      return null;
    };
  },
});
export default Checkbox;

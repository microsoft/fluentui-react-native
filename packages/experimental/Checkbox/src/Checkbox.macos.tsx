/** @jsx withSlots */
import { checkboxName, CheckboxTokens, CheckboxProps, CheckboxState } from './Checkbox.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { ViewProps } from 'react-native';

const NativeCheckboxView = ensureNativeComponent('FRNCheckboxView');

export interface CheckboxTypeMacOS {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: { root: ViewProps };
  state: CheckboxState;
}

export const Checkbox = compose<CheckboxTypeMacOS>({
  displayName: checkboxName,
  tokens: [checkboxName],
  slots: { root: NativeCheckboxView },
  slotProps: {
    root: buildProps<CheckboxProps, CheckboxTokens>(() => ({
      style: {
        minHeight: 20,
        minWidth: 30,
      },
    })),
  },
  render: (props: CheckboxProps, useSlots: UseSlots<CheckboxTypeMacOS>) => {
    const Root = useSlots(props).root;
    return (rest: CheckboxProps) => <Root {...mergeProps(props, rest)} />;
  },
});
export default Checkbox;

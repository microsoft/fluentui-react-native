/** @jsx withSlots */
import { checkboxName, CheckboxTokens, CheckboxProps, CheckboxType } from './Checkbox.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const NativeCheckboxView = ensureNativeComponent('FRNCheckboxView');
export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  tokens: [checkboxName],
  slots: { root: NativeCheckboxView, checkbox: null, checkmark: null, content: null },
  slotProps: {
    root: buildProps<CheckboxProps, CheckboxTokens>(() => ({
      style: {
        minHeight: 20,
        minWidth: 30,
      },
    })),
  },

  render: (props: CheckboxProps, useSlots: UseSlots<CheckboxType>) => {
    const Root = useSlots(props).root;
    return (rest: CheckboxProps) => {
      return <Root onChange {...mergeProps(props, rest)} />;
    };
  },
});
export default Checkbox;

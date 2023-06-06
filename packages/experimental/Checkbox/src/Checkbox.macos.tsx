/** @jsxRuntime classic */
/** @jsx withSlots */
import type { IViewProps } from '@fluentui-react-native/adapters';
import type { CheckboxTokens, CheckboxProps, CheckboxState } from '@fluentui-react-native/checkbox';
import { checkboxName } from '@fluentui-react-native/checkbox';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots, buildProps } from '@fluentui-react-native/framework';

const NativeCheckboxView = ensureNativeComponent('FRNCheckboxView');

interface CheckboxSlotPropsMacOS {
  root: React.PropsWithRef<IViewProps> & { onPress: (e: any) => void };
}

interface CheckboxTypeMacOS {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: CheckboxSlotPropsMacOS;
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
        minWidth: '100%',
      },
    })),
  },
  useRender: (props: CheckboxProps, useSlots: UseSlots<CheckboxTypeMacOS>) => {
    const { onChange, ...restOfUserProps } = props;
    const onPress = (e: any) => {
      if (onChange != null) {
        onChange(e, e.nativeEvent.isChecked);
      }
    };
    const rootProps = { ...restOfUserProps };
    const Root = useSlots(props).root;
    return (rest: CheckboxProps) => {
      return <Root {...mergeProps(rootProps, rest)} onPress={onPress} />;
    };
  },
});
export default Checkbox;

/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SwitchProps } from './Switch.types';
import NativeSwitch from './SwitchNativeComponent';

export const Switch = (props: SwitchProps) => {
  const { onValueChange, ...rest } = props;
  const onValueChangeNative = onValueChange
    ? (event: { nativeEvent: { value: boolean } }) => onValueChange(event.nativeEvent.value)
    : undefined;
  return <NativeSwitch {...rest} onValueChange={onValueChangeNative} />;
};

export default Switch;

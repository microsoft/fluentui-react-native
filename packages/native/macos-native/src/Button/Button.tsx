/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ButtonProps } from './Button.types';
import NativeButton from './ButtonNativeComponent';

export const Button = (props: ButtonProps) => {
  const { onPress, ...rest } = props;
  const onPressNative = onPress ? () => onPress() : undefined;
  return <NativeButton {...rest} onPress={onPressNative} />;
};

export default Button;

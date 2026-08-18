/** @jsxImportSource @fluentui-react-native/framework-base */
import type { PopUpButtonProps } from './PopUpButton.types';
import NativePopUpButton from './PopUpButtonNativeComponent';

export const PopUpButton = (props: PopUpButtonProps) => {
  const { onChange, ...rest } = props;
  const onChangeNative = onChange
    ? (event: { nativeEvent: { selectedIndex: number; identifier: string } }) =>
        onChange(event.nativeEvent.selectedIndex, event.nativeEvent.identifier)
    : undefined;
  return <NativePopUpButton {...rest} onChange={onChangeNative} />;
};

export default PopUpButton;

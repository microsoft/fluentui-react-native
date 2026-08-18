/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SegmentedControlProps } from './SegmentedControl.types';
import NativeSegmentedControl from './SegmentedControlNativeComponent';

export const SegmentedControl = (props: SegmentedControlProps) => {
  const { onChange, ...rest } = props;
  const onChangeNative = onChange
    ? (event: { nativeEvent: { selectedIndex: number } }) => onChange(event.nativeEvent.selectedIndex)
    : undefined;
  return <NativeSegmentedControl {...rest} onChange={onChangeNative} />;
};

export default SegmentedControl;

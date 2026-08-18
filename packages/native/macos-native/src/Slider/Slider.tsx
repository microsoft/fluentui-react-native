/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SliderProps } from './Slider.types';
import NativeSlider from './SliderNativeComponent';

export const Slider = (props: SliderProps) => {
  const { onValueChange, ...rest } = props;
  const onValueChangeNative = onValueChange
    ? (event: { nativeEvent: { value: number } }) => onValueChange(event.nativeEvent.value)
    : undefined;
  return <NativeSlider {...rest} onValueChange={onValueChangeNative} />;
};

export default Slider;

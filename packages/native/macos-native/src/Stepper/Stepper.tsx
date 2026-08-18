/** @jsxImportSource @fluentui-react-native/framework-base */
import type { StepperProps } from './Stepper.types';
import NativeStepper from './StepperNativeComponent';

export const Stepper = (props: StepperProps) => {
  const { onValueChange, ...rest } = props;
  const onValueChangeNative = onValueChange
    ? (event: { nativeEvent: { value: number } }) => onValueChange(event.nativeEvent.value)
    : undefined;
  return <NativeStepper {...rest} onValueChange={onValueChangeNative} />;
};

export default Stepper;

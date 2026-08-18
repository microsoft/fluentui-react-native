/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ProgressIndicatorProps } from './ProgressIndicator.types';
import NativeProgressIndicator from './ProgressIndicatorNativeComponent';

export const ProgressIndicator = (props: ProgressIndicatorProps) => {
  return <NativeProgressIndicator {...props} />;
};

export default ProgressIndicator;

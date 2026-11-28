import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler, Double, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

type ValueRequest = Readonly<{ kind: string; value: Double }>;

export interface NativeProps extends ViewProps {
  targetLabel: string;
  targetTestID?: string;
  minimum: Double;
  maximum: Double;
  step: Double;
  value: Double;
  hasValue?: WithDefault<boolean, true>;
  valueDescription?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  horizontalReversed?: boolean;
  onValueRequest?: DirectEventHandler<ValueRequest>;
}

export default codegenNativeComponent<NativeProps>('FRNNativeCoreRangeTarget') as HostComponent<NativeProps>;

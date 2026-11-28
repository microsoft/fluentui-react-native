import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';

type InputEvent = Readonly<{ kind: string; text: string; value: Double }>;

export interface NativeProps extends ViewProps {
  targetLabel: string;
  targetTestID?: string;
  incrementLabel: string;
  decrementLabel: string;
  draft: string;
  numericValue: Double;
  minimum: Double;
  maximum: Double;
  canIncrement?: boolean;
  canDecrement?: boolean;
  hasLargeStep?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  onEditorInput?: DirectEventHandler<InputEvent>;
}

export default codegenNativeComponent<NativeProps>('FRNNativeCoreSpinEditor') as HostComponent<NativeProps>;

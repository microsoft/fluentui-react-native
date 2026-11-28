import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type Option = Readonly<{ key: string; label: string; disabled: boolean }>;
type SelectionRequest = Readonly<{ key: string }>;

export interface NativeProps extends ViewProps {
  targetLabel: string;
  targetTestID?: string;
  targetHelp?: string;
  options: readonly Option[];
  selectedKey?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  onSelectionRequest?: DirectEventHandler<SelectionRequest>;
}

export default codegenNativeComponent<NativeProps>('FRNNativeCoreSingleSelect') as HostComponent<NativeProps>;

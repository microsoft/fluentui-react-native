import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

type DialogEvent = Readonly<{ kind: string }>;

export interface NativeProps extends ViewProps {
  shown?: boolean;
  mode?: WithDefault<'modal' | 'nonmodal' | 'alert', 'modal'>;
  windowLabel: string;
  onWindowEvent?: DirectEventHandler<DialogEvent>;
}

export default codegenNativeComponent<NativeProps>('FRNNativeCoreDialogWindow') as HostComponent<NativeProps>;

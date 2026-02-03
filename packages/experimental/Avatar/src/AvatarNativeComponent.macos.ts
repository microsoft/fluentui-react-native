import type { HostComponent } from 'react-native';
import type { NativeProps } from './AvatarNative.types';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export default codegenNativeComponent<NativeProps>('FRNAvatarView') as HostComponent<NativeProps>;

import type { HostComponent } from 'react-native';
import type { NativeProps } from './AvatarNative.types';
import { requireNativeComponent } from 'react-native';

export default requireNativeComponent<NativeProps>('FRNAvatarView') as HostComponent<NativeProps>;

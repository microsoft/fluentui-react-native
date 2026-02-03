import type { HostComponent } from 'react-native';
import type { NativeProps } from './VibrancyView.types';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export default codegenNativeComponent<NativeProps>('FRNVibrancyView') as HostComponent<NativeProps>;

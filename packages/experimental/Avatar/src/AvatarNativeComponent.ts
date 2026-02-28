import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent } from 'react-native';

import type { ColorValue, ViewProps, ImageURISource } from 'react-native';

import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  primaryText?: string;
  secondaryText?: string;
  imageSource?: ImageURISource;
  backgroundColor?: ColorValue;
  size?: WithDefault<'size16' | 'size20' | 'size24' | 'size32' | 'size40' | 'size56' | 'size72', undefined>;
}

export default codegenNativeComponent<NativeProps>('FRNAvatarView') as HostComponent<NativeProps>;

import type { ColorValue, ViewProps } from 'react-native';

import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

import type { ImageSource } from './codegenTypes';

export interface NativeProps extends ViewProps {
  primaryText?: string;
  secondaryText?: string;
  imageSource?: ImageSource;
  backgroundColor?: ColorValue;
  size?: WithDefault<'size16' | 'size20' | 'size24' | 'size32' | 'size40' | 'size56' | 'size72', undefined>;
}

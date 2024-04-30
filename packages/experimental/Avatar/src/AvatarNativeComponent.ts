/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { ColorValue, HostComponent, ViewProps } from 'react-native';

import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { ImageSource } from './codegenTypes';

export interface NativeProps extends ViewProps {
  primaryText?: string;
  secondaryText?: string;
  imageSource?: ImageSource;
  backgroundColor?: ColorValue;
  size?: WithDefault<'size16' | 'size20' | 'size24' | 'size32' | 'size40' | 'size56' | 'size72', undefined>;
}

export default codegenNativeComponent<NativeProps>('FRNAvatarView') as HostComponent<NativeProps>;

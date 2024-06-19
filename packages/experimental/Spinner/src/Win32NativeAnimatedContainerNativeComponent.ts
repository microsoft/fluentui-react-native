/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { Double } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  delay?: Double;
  duration?: Double;
  nativeAnimationClass?: string;
}

export default codegenNativeComponent<NativeProps>('RCTNativeAnimatedContainer') as HostComponent<NativeProps>;

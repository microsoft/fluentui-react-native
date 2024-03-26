/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onPress?: BubblingEventHandler<{ isChecked: boolean }>;
  tooltip?: string;
}

export default codegenNativeComponent<NativeProps>('FRNCheckboxView') as HostComponent<NativeProps>;

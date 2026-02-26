/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { ViewProps } from 'react-native';

import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  content?: string;
  disabled?: boolean;
  buttonKey?: string;
  selected?: boolean;
  onPress?: BubblingEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('FRNRadioButtonView');

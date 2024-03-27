/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  navigateAtEnd?: WithDefault<'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue', 'NavigateStopAtEnds'>;
  defaultTabbableElement?: Int32;
  focusZoneDirection?: WithDefault<'bidirectional' | 'vertical' | 'horizontal' | 'none', 'bidirectional'>;
  use2DNavigation?: boolean;
  tabKeyNavigation?: WithDefault<'None' | 'NavigateWrap' | 'NavigateStopAtEnds' | 'Normal', 'None'>;
  disabled?: boolean;
  isTabNavigation?: boolean;
}

export default codegenNativeComponent<NativeProps>('RCTFocusZone') as HostComponent<NativeProps>;

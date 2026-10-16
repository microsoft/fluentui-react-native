/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

import type { HostComponent, ViewProps } from 'react-native';
import type { UnsafeMixed, WithDefault, Int32, DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  commandGeneration?: Int32;
  onOperationResult?: DirectEventHandler<{ generation: Int32; requestId: Int32; status: string }>;
  navigateAtEnd?: WithDefault<'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue', 'NavigateStopAtEnds'>;
  defaultTabbableElement?: UnsafeMixed;
  focusZoneDirection?: WithDefault<'bidirectional' | 'vertical' | 'horizontal' | 'none', 'bidirectional'>;
  use2DNavigation?: boolean;
  tabKeyNavigation?: WithDefault<'None' | 'NavigateWrap' | 'NavigateStopAtEnds' | 'Normal', 'None'>;
  disabled?: boolean;
  isTabNavigation?: boolean;
  navigationOrderInRenderOrder?: boolean;
}

export type FocusZoneComponentType = HostComponent<NativeProps>;

interface NativeCommands {
  requestFocus: (
    viewRef: React.ElementRef<FocusZoneComponentType>,
    generation: Int32,
    requestId: Int32,
    targetTag: Int32,
    strategy: string,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({ supportedCommands: ['requestFocus'] });

export default codegenNativeComponent<NativeProps>('FocusZone', {
  paperComponentName: 'RCTFocusZone',
}) as FocusZoneComponentType;

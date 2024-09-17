/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { WithDefault, DirectEventHandler, Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { CalloutNativeCommands } from './CalloutNativeCommands.types';
import type { UnsafeMixed } from './codegenTypes';
// Should be:
// import type {UnsafeMixed} from 'react-native/Libraries/Types/CodegenTypes';

type AnchorRect = {
  screenX: Double;
  screenY: Double;
  width: Double;
  height: Double;
};

export interface NativeProps extends ViewProps {
  accessibilityLabel?: string;
  accessibilityOnShowAnnouncement?: string;
  anchorRect?: AnchorRect;
  directionalHint?: WithDefault<
    | 'leftTopEdge'
    | 'leftCenter'
    | 'leftBottomEdge'
    | 'topLeftEdge'
    | 'topAutoEdge'
    | 'topCenter'
    | 'topRightEdge'
    | 'rightTopEdge'
    | 'rightCenter'
    | 'rightBottomEdge'
    | 'bottonLeftEdge'
    | 'bottomAutoEdge'
    | 'bottomCenter'
    | 'bottomRightEdge',
    'bottonLeftEdge'
  >;
  dismissBehaviors?: string[];
  doNotTakePointerCapture?: boolean;
  focusable?: boolean;
  isBeakVisible?: boolean;
  maxHeight?: Int32;
  maxWidth?: Int32;
  setInitialFocus?: boolean;
  target?: UnsafeMixed;
  // targetAnchor?: string; // Win32 only Callout can target an anchor registered in the anchor registry // Can be a node id or an anchor ID - This need to be reworked as Mixed types are not supported going forward
  testID?: string;

  onRestoreFocus?: DirectEventHandler<{ target: Int32; containsFocus: boolean }>;
  onDismiss?: DirectEventHandler<{ target: Int32 }>;
  onShow?: DirectEventHandler<{ target: Int32 }>;
}

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

export default codegenNativeComponent<NativeProps>('RCTCallout') as HostComponent<NativeProps>;

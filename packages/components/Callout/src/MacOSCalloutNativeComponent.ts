/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { DirectEventHandler, Double, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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
    | 'bottomLeftEdge'
    | 'bottomAutoEdge'
    | 'bottomCenter'
    | 'bottomRightEdge',
    'topLeftEdge'
  >;
  dismissBehaviors?: string[];
  doNotTakePointerCapture?: boolean;
  focusable?: boolean;
  isBeakVisible?: boolean;
  maxHeight?: Int32;
  maxWidth?: Int32;
  setInitialFocus?: boolean;
  target?: Int32;
  testID?: string;

  onRestoreFocus?: DirectEventHandler<{ target: Int32; containsFocus: boolean }>;
  onDismiss?: DirectEventHandler<{ target: Int32 }>;
  onShow?: DirectEventHandler<{ target: Int32 }>;
}

export type CalloutComponentType = HostComponent<NativeProps>;
export interface CalloutNativeCommands {
  focusWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
  blurWindow: (viewRef: React.ElementRef<CalloutComponentType>) => void;
}

export const Commands: CalloutNativeCommands = codegenNativeCommands<CalloutNativeCommands>({
  supportedCommands: ['blurWindow', 'focusWindow'],
});

export default codegenNativeComponent<NativeProps>('FRNCallout') as CalloutComponentType;

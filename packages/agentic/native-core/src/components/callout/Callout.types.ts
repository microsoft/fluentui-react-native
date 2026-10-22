import type * as React from 'react';
import type { View, ViewProps } from 'react-native';
import type { NativeViewTarget } from '../nativeTarget';
import type { NativeOperationOptions, NativeOperationOutcome } from '../nativeOperation';

export const presentationBrand = Symbol('native-core.presentation');
export interface CalloutPresentation {
  readonly [presentationBrand]: true;
}
export type CalloutAnchor =
  | { kind: 'view'; target: NativeViewTarget }
  | { kind: 'rect'; relativeTo: NativeViewTarget; rect: { x: number; y: number; width: number; height: number } }
  | { kind: 'point'; relativeTo: NativeViewTarget; point: { x: number; y: number } };

export interface CalloutHandle {
  getPresentation(): CalloutPresentation | null;
  requestFocus(
    presentation: CalloutPresentation,
    target: NativeViewTarget | 'first' | 'last',
    options?: NativeOperationOptions,
  ): Promise<NativeOperationOutcome>;
  close(presentation: CalloutPresentation, options?: NativeOperationOptions): Promise<NativeOperationOutcome>;
  reposition(presentation: CalloutPresentation, options?: NativeOperationOptions): Promise<NativeOperationOutcome>;
}

export type CalloutDismissReason =
  | 'native-light-dismiss'
  | 'escape'
  | 'outside-pointer'
  | 'application-deactivated'
  | 'tab-forward'
  | 'tab-backward'
  | 'programmatic'
  | 'anchor-lost'
  | 'host-detached';
export interface CalloutReadyEvent {
  presentation: CalloutPresentation;
}
export interface CalloutDismissedEvent extends CalloutReadyEvent {
  reason: CalloutDismissReason;
}

export interface CalloutProps {
  ref?: React.Ref<CalloutHandle>;
  open: boolean;
  presentationKey?: string;
  anchor: CalloutAnchor;
  placement?: {
    side?: 'top' | 'bottom' | 'start' | 'end' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    gap?: number;
  };
  /**
   * What Tab and Shift+Tab do in the popup: `cycle` moves within it; `dismiss` closes the outermost such presentation
   * in its popup ownership chain; `continue` also moves focus past the view anchor (Tab) or to it (Shift+Tab).
   */
  tabNavigation?: 'cycle' | 'dismiss' | 'continue';
  children?: React.ReactNode;
  content?: Omit<ViewProps, 'children' | 'ref' | 'collapsable'> & { ref?: React.Ref<React.ComponentRef<typeof View>> };
  onReady?: (event: CalloutReadyEvent) => void;
  onDismissed?: (event: CalloutDismissedEvent) => void;
}

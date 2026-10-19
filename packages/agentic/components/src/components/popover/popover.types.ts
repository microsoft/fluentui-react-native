import type * as React from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { RootInputBoundary } from '@fluentui-react-native/design';
import type { ComponentProps, ComponentState, OwnedRootProps, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';

import type { Button } from '../button/button';
import type { PopoverNativeHost } from './popoverNative.types';

/** The preferred side of the trigger. `start` and `end` follow layout direction. */
export type PopoverPlacement = 'top' | 'bottom' | 'start' | 'end';

/** Alignment of the popup along the trigger edge. */
export type PopoverAlign = 'start' | 'center' | 'end';

/**
 * Why requested presence changed: `trigger` when the trigger toggled the popup, or `dismiss` when the native popup
 * closed itself through light dismissal, anchor loss, or detachment.
 */
export type PopoverOpenChangeReason = 'trigger' | 'dismiss';

export interface PopoverOpenChangeData {
  reason: PopoverOpenChangeReason;
}

export type PopoverSlots = {
  /** A structural View whose ref stays stable across presentations. */
  root: Slot<typeof View>;
  /** The component-owned Button that toggles and anchors the popup. */
  trigger: Slot<typeof Button>;
};

/**
 * Props for the floating surface View that hosts the content. It is the native popup's content attachment, so it
 * accepts View props and a ref but cannot be replaced; its ref is null while the popup is closed.
 */
export type PopoverSurfaceProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'collapsable'>;

type PopoverCallout = PopoverNativeHost['Callout'];
type PopoverCalloutProps = React.ComponentProps<PopoverCallout>;

type PopoverStateSlots = PopoverSlots & {
  callout: Slot<PopoverCallout>;
  inputBoundary: Slot<typeof RootInputBoundary>;
};

export type PopoverStateProps = {
  /** Requested presence. When supplied, the caller owns it; `false` and omission are distinct. */
  open?: boolean;
  /** Starting requested presence while Popover owns it. Defaults to false. */
  defaultOpen?: boolean;
  /** Reports changes a person caused. Caller-driven `open` changes are not reported. */
  onOpenChange?: (open: boolean, data: PopoverOpenChangeData) => void;
  /** The preferred side of the trigger. Defaults to `bottom`. */
  placement?: PopoverPlacement;
  /** Alignment along the trigger edge. Defaults to `center`. */
  align?: PopoverAlign;
};

export type PopoverExposedViewProps = OwnedRootProps<PropsWithRefOf<typeof View>>;

type PopoverSlotProps = ComponentProps<PopoverSlots, PopoverExposedViewProps>;

export type PopoverProps = PopoverStateProps &
  Omit<PopoverSlotProps, 'trigger'> & {
    /** Button props for the trigger. */
    trigger: NonNullable<PopoverSlotProps['trigger']>;
    /** Props for the floating surface. Name it with `accessibilityLabel`. */
    surface?: PopoverSurfaceProps;
    /** The popup content. */
    children: React.ReactNode;
  };

export type PopoverState = ComponentState<PopoverStateSlots> &
  ThemeState &
  Required<Pick<PopoverStateProps, 'placement' | 'align'>> & {
    /** Whether the popup is presented: requested and not natively dismissed. */
    open: boolean;
    children: React.ReactNode;
    /** Binds the trigger's native view as the popup anchor. */
    anchorRef: React.RefCallback<React.ComponentRef<typeof View>>;
    /** Binds the surface's native view as the fallback entry-focus target. */
    surfaceTargetRef: React.RefCallback<React.ComponentRef<typeof View>>;
    userStyle?: StyleProp<ViewStyle>;
    surfaceUserStyle?: StyleProp<ViewStyle>;
    /** Render-time native placement, resolved by the style hook. */
    calloutPlacement?: PopoverCalloutProps['placement'];
    /** Render-time surface props, resolved by the style hook. */
    surfaceContent?: PopoverCalloutProps['content'];
  };

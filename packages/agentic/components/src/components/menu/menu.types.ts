import type * as React from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentProps, ComponentState, OwnedRootProps, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';

import type { Button } from '../button/button';
import type { PopoverAlign, PopoverPlacement } from '../popover/popover.types';
import type { MenuPopupProps } from './menuPopup';

export type MenuPlacement = PopoverPlacement;
export type MenuAlign = PopoverAlign;

/**
 * Why requested presence changed: `trigger` when the trigger toggled the menu, `dismiss` when the menu closed itself
 * through light dismissal, Tab, anchor loss, or detachment, or `action` when a row without a submenu ran.
 */
export type MenuOpenChangeReason = 'trigger' | 'dismiss' | 'action';

export interface MenuOpenChangeData {
  reason: MenuOpenChangeReason;
}

export type MenuSlots = {
  /** A structural View whose ref stays stable across presentations. */
  root: Slot<typeof View>;
  /** The component-owned Button that toggles and anchors the menu. */
  trigger: Slot<typeof Button>;
};

/**
 * Props for the menu surface View that hosts the rows. It is the native popup's content attachment, so it accepts
 * View props and a ref but cannot be replaced; its ref is null while the menu is closed.
 */
export type MenuSurfaceProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'collapsable'>;

/** Requested presence and the options a menu family shares. */
export type MenuStateProps = {
  /** Requested presence. When supplied, the caller owns it; `false` and omission are distinct. */
  open?: boolean;
  /** Starting requested presence while Menu owns it. Defaults to false. */
  defaultOpen?: boolean;
  /** Reports changes a person caused. Caller-driven `open` changes are not reported. */
  onOpenChange?: (open: boolean, data: MenuOpenChangeData) => void;
  /** Whether disabled rows stay focusable. Defaults to true on Windows and Win32 and false on macOS. */
  disabledFocusable?: boolean;
  /** Whether pointer hover opens and switches submenus. Defaults to true. */
  submenuOpenOnHover?: boolean;
  /** Milliseconds of hover on a submenu row before its submenu opens. Defaults to the platform's value. */
  submenuOpenDelay?: number;
  /** Milliseconds of hover on another row before an open submenu closes or switches. Defaults to the platform's value. */
  submenuCloseDelay?: number;
};

export type MenuPlacementProps = {
  /** The preferred side of the trigger. Defaults to `bottom`. */
  placement?: MenuPlacement;
  /** Alignment along the trigger edge. Defaults to `center`. */
  align?: MenuAlign;
};

export type MenuExposedViewProps = OwnedRootProps<PropsWithRefOf<typeof View>>;

type MenuSlotProps = ComponentProps<MenuSlots, MenuExposedViewProps>;

export type MenuProps = MenuStateProps &
  MenuPlacementProps &
  Omit<MenuSlotProps, 'trigger'> & {
    /** Button props for the trigger. */
    trigger: NonNullable<MenuSlotProps['trigger']>;
    /** Props for the menu surface. Its name defaults to the trigger's string content. */
    surface?: MenuSurfaceProps;
    /** MenuItem and Divider rows. */
    children: React.ReactNode;
  };

/** The menu popup family for a trigger; shared by Menu and MenuButton. */
export interface MenuPopupState {
  /** Whether the menu is presented: requested, enabled, and not natively dismissed. */
  open: boolean;
  /** Props for the private root popup; the style phase adds the surface style and gap. */
  popupProps: MenuPopupProps;
  /** Binds the trigger's native view as the popup anchor. */
  anchorRef: React.RefCallback<React.ComponentRef<typeof View>>;
}

export type MenuState = ComponentState<MenuSlots> &
  ThemeState &
  MenuPopupState & {
    userStyle?: StyleProp<ViewStyle>;
  };

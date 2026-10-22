import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { CalloutDismissReason, NativeViewTarget } from '@fluentui-react-native/native-core/macos';

import type { PopupHost } from '../../common/popupHost.types';
import type { MenuItemProps } from '../menu-item/menu-item.types';

/** Submenus nest at most this many levels below the root menu. */
export const maxSubmenuLevel = 2;

/**
 * Where focus goes when a popup is presented: its first or last row, its surface (a pointer open, with no highlighted
 * row), or nowhere (a submenu opened by pointer or hover).
 */
export type MenuEntry = 'first' | 'last' | 'surface' | 'none';

/** Options and services every popup in one menu family shares. */
export interface MenuFamily {
  host: PopupHost;
  /** Closes the whole family because a row without a submenu ran. */
  closeFamily(): void;
  disabledFocusable: boolean;
  hover: { enabled: boolean; openDelay: number; closeDelay: number };
  rtl: boolean;
  surfaceStyle: StyleProp<ViewStyle>;
  gap: number;
  /** Renders a row that declares a submenu; injected so popups do not import submenu rows. */
  SubmenuRow: React.ComponentType<MenuItemProps>;
}

export const MenuFamilyContext = React.createContext<MenuFamily | undefined>(undefined);

/** The submenu a popup level has open, and how it was opened. */
export interface MenuOpenChild {
  id: string;
  entry: MenuEntry;
  /** Changes whenever the child should apply `entry` again. */
  key: number;
}

/** One popup level as its submenu rows and child popup see it. */
export interface MenuLevel {
  level: number;
  openChild: MenuOpenChild | null;
  setRowTarget(id: string, target: NativeViewTarget | null): void;
  onChildDismissed(id: string, reason: CalloutDismissReason): void;
  closeChild(id: string, restoreRow: boolean): void;
  cancelHover(): void;
}

export const MenuLevelContext = React.createContext<MenuLevel | undefined>(undefined);

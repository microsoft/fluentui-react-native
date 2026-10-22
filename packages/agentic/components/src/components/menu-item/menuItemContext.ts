import * as React from 'react';

import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';

import type { MenuItemProps } from './menu-item.types';

/** A list row as its Menu sees it. */
export interface MenuItemMenuRow {
  readonly id: string;
  /** The label that type-ahead matches. */
  readonly text: string;
  readonly hasSubmenu: boolean;
  /** Whether the row is a focus stop, including a disabled-focusable row. */
  readonly focusable: boolean;
  focus(): void;
}

/**
 * Supplied by the Menu that renders a row. MenuItem depends only on this interface, so it never imports Menu or
 * native-core; a standalone row sees `undefined`.
 */
export interface MenuItemMenuBinding {
  /** The Menu's default for rows that omit `disabledFocusable`. */
  readonly disabledFocusable: boolean;
  register(row: MenuItemMenuRow): () => void;
  isSubmenuOpen(id: string): boolean;
  onRowPress(id: string, keyboard: boolean): void;
  onRowFocus(id: string): void;
  onRowBlur(id: string): void;
  onRowHoverIn(id: string): void;
  onRowHoverOut(id: string): void;
  onRowKeyDown(id: string, event: FocusKeyboardEvent): void;
  /** Renders a row that declares a submenu, together with its popup. */
  SubmenuRow: React.ComponentType<MenuItemProps>;
}

export const MenuItemMenuContext = React.createContext<MenuItemMenuBinding | undefined>(undefined);

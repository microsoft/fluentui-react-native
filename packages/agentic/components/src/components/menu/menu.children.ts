import * as React from 'react';
import { StyleSheet } from 'react-native';
import { MenuItem } from '../menu-item/menu-item';
import type { MenuItemProps } from '../menu-item/menu-item.types';
import { Divider } from '../divider/divider';
import type { DividerProps } from '../divider/divider.types';
import { MenuEntry } from './menu-entry';
import type { MenuEntryProps, MenuSubmenuContent } from './menu-entry.types';
import type { MenuNavigationItem } from './menu.keyboard';

const forbidden = [
  'root',
  'children',
  'menuStyle',
  'loading',
  'hasChevron',
  'hasCheckmark',
  'hasMultiselect',
  'role',
  'accessibilityRole',
  'focusable',
  'accessible',
  'tabIndex',
  'keyDownEvents',
  'keyUpEvents',
  'validKeysDown',
  'validKeysUp',
  'aria-disabled',
  'aria-checked',
  'aria-expanded',
  'as',
  'aria-hidden',
  'accessibilityElementsHidden',
  'importantForAccessibility',
];
export function getMenuEntryError(props: MenuEntryProps, depth: number): string | undefined {
  const submenu: MenuSubmenuContent | undefined = props.submenu;
  const submenuState = { open: props.submenuOpen, defaultOpen: props.defaultSubmenuOpen, onChange: props.onSubmenuOpenChange };
  const booleans: readonly (readonly [string, unknown])[] = [
    ['disabled', props.disabled],
    ['selected', props.selected],
    ['submenuOpen', props.submenuOpen],
    ['defaultSubmenuOpen', props.defaultSubmenuOpen],
  ];
  const invalidBoolean = booleans.find(([, value]) => value !== undefined && typeof value !== 'boolean');
  if (invalidBoolean) return `${invalidBoolean[0]} must be a boolean`;
  const owned = forbidden.find((key) => Object.hasOwn(props, key));
  if (owned) return `unsupported owned prop "${owned}"`;
  if (typeof props.itemId !== 'string' || !props.itemId.trim()) return 'nonempty itemId required';
  if (typeof props.content !== 'string' || !props.content.trim()) return 'nonempty content required';
  if (props.textValue !== undefined && (typeof props.textValue !== 'string' || !props.textValue.trim()))
    return 'nonempty textValue required';
  if (props.checkable && props.submenu) return 'checkable and submenu are exclusive';
  if (props.checkable && !['radio', 'checkbox'].includes(props.checkable)) return 'unsupported checkable kind';
  if (props.checkable && typeof props.selected !== 'boolean') return 'checkable requires external selected';
  if (props.checkable === 'radio' && (typeof props.selectionGroup !== 'string' || !props.selectionGroup.trim()))
    return 'radio requires selectionGroup';
  if (props.checkable !== 'radio' && props.selectionGroup !== undefined) return 'selectionGroup is radio-only';
  if (submenu) {
    if (depth >= 2) return 'only two descendant submenu levels are allowed';
    if (props.onAction || props.selected !== undefined) return 'submenu cannot own an action or selection';
    if (typeof submenu.surfaceAccessibilityLabel !== 'string' || !submenu.surfaceAccessibilityLabel.trim()) return 'submenu name required';
  } else if (submenuState.open !== undefined || submenuState.defaultOpen !== undefined || submenuState.onChange !== undefined) {
    return 'submenu state requires submenu content';
  }
  if (typeof props.style === 'function') return 'style must be a View style, not a callback';
  const style = StyleSheet.flatten(props.style);
  if (style?.display === 'none' || style?.opacity === 0) return 'hidden registered entries are unsupported';
  const state = props.accessibilityState;
  if (state && ['disabled', 'checked', 'expanded', 'selected'].some((key) => Object.hasOwn(state, key)))
    return 'owned accessibility state must use entry props';
  return undefined;
}

export function getMenuInventory(children: React.ReactNode, depth = 0): MenuNavigationItem[] {
  const items: MenuNavigationItem[] = [];
  const ids = new Set<string>();
  let initiallyOpen = 0;
  const visit = (nodes: React.ReactNode) =>
    React.Children.forEach(nodes, (node) => {
      if (node == null || typeof node === 'boolean') return;
      if (!React.isValidElement(node)) throw new Error('Menu content accepts only MenuEntry, section headers, Divider, and fragments.');
      if (node.type === React.Fragment) {
        visit((node.props as { children?: React.ReactNode }).children);
      } else if (node.type === MenuEntry) {
        const props = node.props as MenuEntryProps;
        const error = getMenuEntryError(props, depth);
        if (error) throw new Error(`MenuEntry "${props.itemId}": ${error}.`);
        if (ids.has(props.itemId)) throw new Error(`MenuEntry itemId "${props.itemId}" must be unique among siblings.`);
        ids.add(props.itemId);
        if (props.submenu) {
          getMenuInventory(props.submenu.content?.children, depth + 1);
          if (props.submenuOpen ?? props.defaultSubmenuOpen ?? false) initiallyOpen++;
        }
        items.push({
          itemId: props.itemId,
          disabled: Boolean(props.disabled),
          textValue: props.textValue ?? props.content,
          submenu: !!props.submenu,
        });
      } else if (node.type === MenuItem) {
        if ((node.props as MenuItemProps).menuStyle !== 'section-header')
          throw new Error('Interactive MenuItem must use the MenuEntry adapter.');
      } else if (node.type === Divider) {
        if ((node.props as DividerProps).vertical) throw new Error('Menu Divider must be horizontal.');
      } else {
        throw new Error('Menu does not inspect opaque custom children or nested editors.');
      }
    });
  visit(children);
  if (initiallyOpen > 1) throw new Error('Menu cannot present multiple initially-open sibling submenus.');
  return items;
}

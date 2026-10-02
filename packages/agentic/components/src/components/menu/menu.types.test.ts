import * as React from 'react';
import type { View, Pressable } from 'react-native';
import type { MenuProps, MenuContentProps, MenuTriggerProps } from './menu.types';
import { Menu } from './menu';
import { useMenu_unstable } from './useMenu';
import { renderMenu_unstable } from './renderMenu';

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const keys: Assert<
  Equal<Extract<keyof MenuProps, 'surface' | 'onRestoreFocus' | 'initialFocus' | 'children' | 'menuFocusManagement'>, never>
> = true;
const contentKeys: Assert<Equal<Extract<keyof MenuContentProps, 'as' | 'role' | 'focusable' | 'onKeyDown'>, never>> = true;
const triggerKeys: Assert<Equal<Extract<keyof MenuTriggerProps, 'as' | 'focusable' | 'role'>, never>> = true;
const rootRef: Assert<Equal<MenuProps['ref'], React.ComponentPropsWithRef<typeof View>['ref']>> = true;
const triggerRef: Assert<Equal<MenuTriggerProps['ref'], React.ComponentPropsWithRef<typeof Pressable>['ref']>> = true;
const props: MenuProps = { surfaceAccessibilityLabel: 'Commands', open: false, defaultOpen: true, ref: React.createRef<View>() };

describe('Menu types', () => {
  it('keeps native roots and bounded slots without exposing popup transport', () => {
    expect([keys, contentKeys, triggerKeys, rootRef, triggerRef]).toEqual([true, true, true, true, true]);
    expect(React.createElement(Menu, props)).toBeDefined();
    expect(useMenu_unstable).toBeDefined();
    expect(renderMenu_unstable).toBeDefined();
  });
});

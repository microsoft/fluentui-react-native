import * as React from 'react';
import type { Pressable } from 'react-native';
import type { MenuActionEvent, MenuEntryProps } from './menu-entry.types';

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Rejected<T> = T extends MenuEntryProps ? false : true;
const requiredIdentity: Assert<Rejected<{ content: string }>> = true;
const radioGroup: Assert<Rejected<{ itemId: string; content: string; checkable: 'radio'; selected: boolean }>> = true;
const selectedRequired: Assert<Rejected<{ itemId: string; content: string; checkable: 'checkbox' }>> = true;
const exclusive: Assert<
  Rejected<{
    itemId: string;
    content: string;
    checkable: 'checkbox';
    selected: boolean;
    submenu: { surfaceAccessibilityLabel: string };
  }>
> = true;
const ownedKeys: Assert<
  Equal<
    Extract<
      keyof MenuEntryProps,
      'root' | 'as' | 'hasCheckmark' | 'hasChevron' | 'hasMultiselect' | 'children' | 'menuStyle' | 'loading' | 'defaultSelected'
    >,
    never
  >
> = true;
const refType: Assert<Equal<MenuEntryProps['ref'], React.ComponentPropsWithRef<typeof Pressable>['ref']>> = true;
const optionalEvent: Assert<Equal<Parameters<NonNullable<MenuEntryProps['onAction']>>['length'], 0 | 1>> = true;
const command: MenuEntryProps = { itemId: 'save', content: 'Save', onAction: () => undefined };
const radio: MenuEntryProps = { itemId: 'one', content: 'One', checkable: 'radio', selectionGroup: 'number', selected: false };
const checkbox: MenuEntryProps = { itemId: 'mark', content: 'Mark', checkable: 'checkbox', selected: true };
const submenu: MenuEntryProps = {
  itemId: 'more',
  content: 'More',
  submenu: { surfaceAccessibilityLabel: 'More commands' },
  defaultSubmenuOpen: false,
  onSubmenuOpenChange: (open: boolean) => open,
};

describe('MenuEntry types', () => {
  it('enforces identity, exclusive kinds, required checked state and native refs', () => {
    expect([requiredIdentity, radioGroup, selectedRequired, exclusive, ownedKeys, refType]).toEqual([true, true, true, true, true, true]);
    expect([command.itemId, radio.itemId, checkbox.itemId, submenu.itemId]).toEqual(['save', 'one', 'mark', 'more']);
    expect(optionalEvent).toBe(true);
  });
  it('accepts the original event union or a genuinely omitted AX event', () => {
    const received: (MenuActionEvent | undefined)[] = [];
    const eventless: MenuEntryProps = {
      itemId: 'ax',
      content: 'AX',
      onAction: (event?: MenuActionEvent) => {
        received.push(event);
      },
    };
    eventless.onAction?.();
    eventless.onAction?.(undefined);
    expect(received).toEqual([undefined, undefined]);
  });
});

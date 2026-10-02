/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import type { FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';
import type { PopoverMenuHostBinding, PopoverMenuHostSnapshot } from '../popover/popover.types';
import type { CalloutCloseOutcome, CalloutCloseReason, CalloutMenuPointerMoveEvent } from '@fluentui-react-native/callout';
import { act, fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Menu } from './menu';
import { MenuEntry } from './menu-entry';
import { MenuItem } from '../menu-item/menu-item';
import { Divider } from '../divider/divider';
import { getMenuInventory } from './menu.children';
import { menuKeyDestination } from './menu.keyboard';
import { createMenuScope } from './menu.controller';
import { assertMenuPlatform } from './menu.platform';
import { useMenu_unstable } from './useMenu';
import { useMenuStyles_unstable } from './useMenuStyles';
import type { MenuProps } from './menu.types';

const items = [
  { itemId: 'one', textValue: 'Alpha', disabled: false, submenu: false },
  { itemId: 'disabled', textValue: 'Another', disabled: true, submenu: false },
  { itemId: 'two', textValue: 'April', disabled: false, submenu: true },
  { itemId: 'three', textValue: 'Éclair', disabled: false, submenu: false },
];
const key = (value: string, modifiers = {}): FocusKeyboardEvent => ({
  nativeEvent: { key: value, ...modifiers },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
});
function movement(host: View, patch: Partial<CalloutMenuPointerMoveEvent['nativeEvent']> = {}): CalloutMenuPointerMoveEvent {
  return {
    nativeEvent: { generation: 'native-1', pointerId: 'mouse', screenX: 50, screenY: 50, targetTag: 77, ...patch },
    currentTarget: host,
    target: host,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: 0,
    type: 'menuPointerMove',
    preventDefault: () => undefined,
    stopPropagation: () => undefined,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => undefined,
  };
}
async function fixture() {
  const focus = jest.fn(async () => ({ status: 'confirmed' as const }));
  const close = jest.fn(
    async (_generation: string, reason: CalloutCloseReason, returnFocus: boolean): Promise<CalloutCloseOutcome> => ({
      status: 'confirmed',
      returnFocus: returnFocus && reason !== 'programmatic' ? 'confirmed' : 'not-requested',
    }),
  );
  const lease = new AbortController();
  let snapshot: PopoverMenuHostSnapshot | undefined = {
    phase: 'ready',
    nativeGeneration: 'native-1',
    anchorMountGeneration: 1,
    signal: lease.signal,
    handle: { focusInitialChild: focus, focusOwnedChild: focus, closeOwned: close },
  };
  const binding: PopoverMenuHostBinding = { getCurrent: () => snapshot };
  const scope = createMenuScope(0, undefined, () => 77);
  const detach = scope.mount();
  const hostRef = React.createRef<View>();
  await render(<View ref={hostRef} />);
  const view = hostRef.current;
  if (!view) throw new Error('Menu fixture requires a committed native host ref.');
  const target: FocusTarget = {
    current: view,
    generation: 1,
    getSnapshot: () => ({ focused: false }),
    subscribe: () => () => undefined,
    requestFocus: () => {
      throw new Error('Menu must never invoke ordinary JS focus.');
    },
  };
  const nativeRef = { current: view };
  const expansion = jest.fn();
  scope.configure(items);
  for (const item of items) {
    scope.register(item.itemId, { target, nativeRef, requestSubmenu: expansion });
  }
  scope.ready(binding, 'native-1');
  return {
    scope,
    focus,
    close,
    lease,
    binding,
    target,
    nativeRef,
    expansion,
    detach,
    hide: () => {
      lease.abort();
      snapshot = undefined;
      scope.dismissed();
    },
  };
}

describe('Menu navigation and membership', () => {
  it.each([
    ['ArrowDown', 'one', 'two'],
    ['ArrowUp', 'one', 'three'],
    ['Home', 'three', 'one'],
    ['End', 'one', 'three'],
    ['a', 'one', 'two'],
    ['É', 'one', 'three'],
  ])('resolves %s without selecting/activating', (name, from, to) => {
    expect(menuKeyDestination(items, from, key(name), false, false)).toEqual({ kind: 'focus', itemId: to });
  });
  it('supports RTL submenu keys and delegates Escape/Tab/Space/modifiers/dead keys', () => {
    expect(menuKeyDestination(items, 'two', key('ArrowLeft'), true, true)).toEqual({ kind: 'open' });
    expect(menuKeyDestination(items, 'one', key('ArrowRight'), true, true)).toEqual({ kind: 'back' });
    for (const name of ['Escape', 'Tab', ' ', 'Enter', 'Dead', 'Unidentified']) {
      expect(menuKeyDestination(items, 'one', key(name), false, false)).toBeUndefined();
    }
    expect(menuKeyDestination(items, 'one', key('ArrowDown', { ctrlKey: true }), false, false)).toBeUndefined();
    expect(menuKeyDestination(items, 'one', { ...key('ArrowDown'), defaultPrevented: true }, false, false)).toBeUndefined();
  });
  it('validates direct headers/separators, fragments, explicit IDs and two submenu levels', () => {
    const inventory = getMenuInventory(
      <>
        <MenuItem menuStyle="section-header" content="Group" />
        <Divider label={null} />
        <MenuEntry itemId="save" content="Save" />
      </>,
    );
    expect(inventory).toEqual([{ itemId: 'save', textValue: 'Save', disabled: false, submenu: false }]);
    expect(() => getMenuInventory(<View />)).toThrow('opaque');
    expect(() => getMenuInventory(<MenuItem content="Not registered" />)).toThrow('adapter');
    expect(() =>
      getMenuInventory(
        <>
          <MenuEntry itemId="same" content="One" />
          <MenuEntry itemId="same" content="Two" />
        </>,
      ),
    ).toThrow('unique');
    expect(() => getMenuInventory(<MenuEntry itemId="deep" content="Deep" submenu={{ surfaceAccessibilityLabel: 'Deep' }} />, 2)).toThrow(
      'two',
    );
    expect(getMenuInventory(null)).toEqual([]);
  });
});

describe('Menu native scope bookkeeping', () => {
  it('waits for ready, focuses first eligible, and uses owned focus for arrows', async () => {
    const f = await fixture();
    await Promise.resolve();
    expect(f.focus.mock.calls[0]).toEqual(['native-1', f.nativeRef]);
    expect(f.scope.getSnapshot().activeId).toBe('one');
    f.scope.key('one', key('ArrowDown'), false);
    await Promise.resolve();
    expect(f.focus.mock.calls[1]).toEqual(['native-1', f.nativeRef, 'keyboard']);
    expect(f.scope.getSnapshot().activeId).toBe('two');
    f.detach();
  });
  it('ignores stale Promise confirmation after signal abort or newer navigation', async () => {
    const f = await fixture();
    await Promise.resolve();
    let resolve: (value: { status: 'confirmed' }) => void;
    f.focus.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const request = f.scope.requestFocus('two', 'keyboard');
    f.hide();
    resolve({ status: 'confirmed' });
    expect(await request).toBe(false);
    expect(f.scope.getSnapshot().activeId).toBeUndefined();
    f.detach();
  });
  it('closes natively before teardown and never dispatches Escape/Tab', async () => {
    const f = await fixture();
    await Promise.resolve();
    f.scope.key('one', key('Escape'), false);
    f.scope.key('one', key('Tab'), false);
    expect(f.close).not.toHaveBeenCalled();
    await f.scope.close('action', true);
    expect(f.close).toHaveBeenCalledWith('native-1', 'action', true);
    f.detach();
  });
  it('shares a pending identical close instead of racing sibling requests', async () => {
    const f = await fixture();
    await Promise.resolve();
    let resolve: (outcome: CalloutCloseOutcome) => void;
    f.close.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const first = f.scope.close('programmatic', false);
    const second = f.scope.close('programmatic', false);
    expect(f.close).toHaveBeenCalledTimes(1);
    resolve({ status: 'confirmed', returnFocus: 'not-requested' });
    expect((await first)?.status).toBe('confirmed');
    expect((await second)?.returnFocus).toBe('not-requested');
    f.detach();
  });
  it('rejects root submenu-back and does not invent unsupported methods or outside ownership', async () => {
    const f = await fixture();
    await expect(f.scope.close('submenu-back', true)).rejects.toThrow('Root');
    f.hide();
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await f.scope.requestFocus('two', 'repair')).toBe(false);
    expect(f.focus).toHaveBeenCalledTimes(1);
    warning.mockRestore();
    f.detach();
  });
  it('does not refocus from stale hover or a native no-hit point', async () => {
    const f = await fixture();
    await Promise.resolve();
    f.scope.pointer(movement(f.nativeRef.current, { targetTag: 0 }), f.binding);
    expect(f.focus).toHaveBeenCalledTimes(1);
    f.detach();
  });
  it('matches a current-event hit to a live ref and never dispatches the event tag', async () => {
    const f = await fixture();
    await Promise.resolve();
    f.scope.family.keyboard = true;
    f.scope.pointer(movement(f.nativeRef.current), f.binding);
    await Promise.resolve();
    expect(f.scope.family.keyboard).toBe(false);
    expect(f.focus).toHaveBeenLastCalledWith('native-1', f.nativeRef, 'pointer');
    expect(f.focus).not.toHaveBeenCalledWith('native-1', 77, 'pointer');
    f.detach();
  });
  it('rejects malformed hits and ignores unknown/stale tags without a hovered-row fallback', async () => {
    const f = await fixture();
    await Promise.resolve();
    expect(() => f.scope.pointer(movement(f.nativeRef.current, { targetTag: -1 }), f.binding)).toThrow('hit identity');
    f.scope.pointer(movement(f.nativeRef.current, { targetTag: 88 }), f.binding);
    f.scope.pointer(movement(f.nativeRef.current, { generation: 'old', targetTag: 77, screenX: 60 }), f.binding);
    expect(f.focus).toHaveBeenCalledTimes(1);
    f.detach();
  });
  it('repairs a disabled current entry only through native owned-child focus', async () => {
    const f = await fixture();
    await Promise.resolve();
    f.scope.configure(items.map((item) => (item.itemId === 'one' ? { ...item, disabled: true } : item)));
    await Promise.resolve();
    expect(f.focus).toHaveBeenLastCalledWith('native-1', f.nativeRef, 'repair');
    expect(f.scope.getSnapshot().activeId).toBe('two');
    f.detach();
  });
  it('clears active bookkeeping without fake focus for all-disabled content', async () => {
    const f = await fixture();
    await Promise.resolve();
    f.scope.configure(items.map((item) => ({ ...item, disabled: true })));
    expect(f.scope.getSnapshot().activeId).toBeUndefined();
    expect(f.focus).toHaveBeenCalledTimes(1);
    f.scope.key('one', key('ArrowDown'), false);
    expect(f.focus).toHaveBeenCalledTimes(1);
    f.detach();
  });
  it('retains logical identity on reorder and rejects stale registration cleanup', async () => {
    const f = await fixture();
    await Promise.resolve();
    const old = f.scope.register('one', { target: f.target, nativeRef: f.nativeRef, requestSubmenu: f.expansion });
    f.scope.register('one', { target: f.target, nativeRef: f.nativeRef, requestSubmenu: f.expansion });
    old();
    f.scope.configure([...items].reverse());
    expect(f.scope.getSnapshot().activeId).toBe('one');
    expect(await f.scope.requestFocus('one', 'keyboard')).toBe(true);
    f.detach();
  });
  it('dispatches descendant action to native family arbitration, never JS parent bubbling', async () => {
    const f = await fixture();
    await Promise.resolve();
    const child = createMenuScope(1, f.scope, () => 77);
    const detach = child.mount();
    child.configure(items);
    child.register('one', { target: f.target, nativeRef: f.nativeRef, requestSubmenu: f.expansion });
    child.ready(f.binding, 'native-1');
    const parentClose = jest.spyOn(f.scope, 'close');
    await child.close('action', true);
    expect(parentClose).not.toHaveBeenCalled();
    expect(f.close).toHaveBeenCalledWith('native-1', 'action', true);
    detach();
    f.detach();
  });
});

describe('Menu public surface', () => {
  it('applies structural content defaults before caller spacing without rendering the slot early', async () => {
    function ContentProbe(props: MenuProps) {
      const state = useMenu_unstable(props);
      useMenuStyles_unstable(state);
      const Content = state.content;
      return Content ? <Content /> : null;
    }
    const result = await render(
      <ContentProbe surfaceAccessibilityLabel="Commands" content={{ testID: 'menu-content-style', style: { gap: 16 } }} />,
    );
    expect(StyleSheet.flatten(result.getByTestId('menu-content-style').props.style)).toMatchObject({ flexDirection: 'column', gap: 16 });
  });
  it('renders import-safe closed state and preserves style/trigger observers', async () => {
    const onPress = jest.fn();
    const result = await render(
      <Menu surfaceAccessibilityLabel="Commands" style={{ margin: 7 }} testID="menu-root" trigger={{ testID: 'menu-trigger', onPress }} />,
    );
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(StyleSheet.flatten(result.getByTestId('menu-root').props.style).margin).toBe(7);
    await fireEvent.press(result.getByTestId('menu-trigger'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it.each(['windows', 'win32', 'ios'])('rejects %s use before native work, including closed Menu', (platform) => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: platform });
    try {
      expect(assertMenuPlatform).toThrow('admission is gated');
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: original });
    }
  });
  it('rejects missing names without creating a native popup', async () => {
    await expect(render(<Menu surfaceAccessibilityLabel="" />)).rejects.toThrow('surfaceAccessibilityLabel');
  });
  it('allows controlled false to remain closed after trigger request', async () => {
    const changes = jest.fn();
    const result = await render(
      <Menu surfaceAccessibilityLabel="Commands" open={false} defaultOpen onOpenChange={changes} trigger={{ testID: 'menu-trigger' }} />,
    );
    await fireEvent.press(result.getByTestId('menu-trigger'));
    expect(changes).toHaveBeenCalledWith(true);
    expect(result.queryByTestId('popover-surface')).toBeNull();
  });
  it.each([false, true])('handles eventless trigger activation with disabled=%s without synthesizing a press', async (disabled) => {
    const order: string[] = [];
    const changes = jest.fn((_open: boolean) => {
      order.push('request');
    });
    const tap = jest.fn(() => {
      order.push('tap');
    });
    const press = jest.fn();
    const named = jest.fn();
    const result = await render(
      <Menu
        surfaceAccessibilityLabel="Commands"
        open={false}
        disabled={disabled}
        onOpenChange={changes}
        trigger={{ testID: 'menu-ax-trigger', onAccessibilityTap: tap, onPress: press, onAccessibilityAction: named }}
      />,
    );
    await act(() => result.getByTestId('menu-ax-trigger').props.onAccessibilityTap());
    expect(tap).toHaveBeenCalledTimes(1);
    expect(tap).toHaveBeenCalledWith();
    expect(press).not.toHaveBeenCalled();
    expect(named).not.toHaveBeenCalled();
    expect(order).toEqual(disabled ? ['tap'] : ['request', 'tap']);
    expect(changes).toHaveBeenCalledTimes(disabled ? 0 : 1);
    if (!disabled) expect(changes).toHaveBeenCalledWith(true);
    expect(result.queryByTestId('popover-surface')).toBeNull();
  });
  it('toggles uncontrolled trigger state directly from genuine eventless taps', async () => {
    const changes = jest.fn();
    const tap = jest.fn();
    const press = jest.fn();
    const result = await render(
      <Menu
        surfaceAccessibilityLabel="Commands"
        onOpenChange={changes}
        trigger={{ testID: 'menu-ax-trigger', onAccessibilityTap: tap, onPress: press }}
      />,
    );
    await act(() => result.getByTestId('menu-ax-trigger').props.onAccessibilityTap());
    expect(result.getByTestId('menu-ax-trigger').props.accessibilityState.expanded).toBe(true);
    await act(() => result.getByTestId('menu-ax-trigger').props.onAccessibilityTap());
    expect(result.getByTestId('menu-ax-trigger').props.accessibilityState.expanded).toBe(false);
    expect(changes.mock.calls).toEqual([[true], [false]]);
    expect(tap).toHaveBeenCalledTimes(2);
    expect(press).not.toHaveBeenCalled();
  });
});

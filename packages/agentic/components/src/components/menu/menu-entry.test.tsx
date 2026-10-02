/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { NativeSyntheticEvent, View } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { MenuEntry } from './menu-entry';
import type { MenuEntryProps } from './menu-entry.types';
import { MenuContext } from './MenuContext';
import { createMenuScope } from './menu.controller';

async function entry(props: MenuEntryProps) {
  const scope = createMenuScope(0, undefined, () => null);
  scope.configure([{ itemId: props.itemId, disabled: Boolean(props.disabled), textValue: props.content, submenu: !!props.submenu }]);
  const action = jest.spyOn(scope, 'action').mockImplementation(() => undefined);
  jest.spyOn(scope, 'canInvoke').mockReturnValue(true);
  const open = jest.spyOn(scope, 'openSubmenu').mockResolvedValue(undefined);
  const result = await render(
    <MenuContext.Provider value={scope}>
      <MenuEntry {...props} />
    </MenuContext.Provider>,
  );
  return { scope, result, action, open };
}

function nativeEvent<T>(host: View, value: T): NativeSyntheticEvent<T> {
  return {
    nativeEvent: value,
    currentTarget: host,
    target: host,
    bubbles: false,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: 1,
    type: 'menuTestNativeEvent',
    preventDefault: () => undefined,
    stopPropagation: () => undefined,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => undefined,
  };
}

describe('MenuEntry', () => {
  it.each([false, true])('switches controlled sibling expansion in one commit with reversed=%s', async (reversed) => {
    const scope = createMenuScope(0, undefined, () => null);
    const rows = (openId: string) => {
      const ids = reversed ? ['second', 'first'] : ['first', 'second'];
      return (
        <MenuContext.Provider value={scope}>
          {ids.map((itemId) => (
            <MenuEntry
              key={itemId}
              itemId={itemId}
              content={itemId}
              submenuOpen={itemId === openId}
              submenu={{ surfaceAccessibilityLabel: `${itemId} commands` }}
            />
          ))}
        </MenuContext.Provider>
      );
    };
    const result = await render(rows('first'));
    expect(scope.getSnapshot().branchId).toBe('first');
    await result.rerender(rows('second'));
    expect(scope.getSnapshot().branchId).toBe('second');
    await result.rerender(rows('first'));
    expect(scope.getSnapshot().branchId).toBe('first');
    await result.unmount();
    expect(scope.getSnapshot().branchId).toBeUndefined();
  });
  it.each(['checkbox', 'radio'] as const)('uses %s semantics and never mutates external selection', async (checkable) => {
    const onAction = jest.fn();
    const onPress = jest.fn();
    const props: MenuEntryProps =
      checkable === 'radio'
        ? { itemId: 'choose', content: 'Choose', checkable, selectionGroup: 'group', selected: false, onAction, onPress }
        : { itemId: 'choose', content: 'Choose', checkable, selected: false, onAction, onPress };
    const { result, action } = await entry(props);
    const root = result.getByRole(checkable === 'radio' ? 'menuitemradio' : 'menuitemcheckbox');
    await fireEvent.press(root);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(root.props.accessibilityState.checked).toBe(false);
  });
  it('runs the semantic action and genuine press observer before atomic close', async () => {
    const order: string[] = [];
    const { result, scope } = await entry({
      itemId: 'save',
      content: 'Save',
      onAction: () => order.push('action'),
      onPress: () => order.push('press'),
    });
    jest.spyOn(scope, 'action').mockImplementation(() => {
      order.push('close');
    });
    await fireEvent.press(result.getByRole('menuitem'));
    expect(order).toEqual(['action', 'press', 'close']);
  });
  it('forwards named action exactly once without synthesizing onPress', async () => {
    const observer = jest.fn();
    const onPress = jest.fn();
    const onTap = jest.fn();
    const onAction = jest.fn();
    const ref = React.createRef<View>();
    const { result, action } = await entry({
      itemId: 'mark',
      content: 'Mark',
      checkable: 'checkbox',
      selected: false,
      onAction,
      onPress,
      onAccessibilityTap: onTap,
      onAccessibilityAction: observer,
      ref,
    });
    const root = result.getByRole('menuitemcheckbox');
    if (!ref.current) throw new Error('MenuEntry action fixture requires its actual native row.');
    const event = nativeEvent(ref.current, { actionName: 'Toggle' });
    await act(() => root.props.onAccessibilityAction(event));
    expect(onAction).toHaveBeenCalledWith(event);
    expect(observer).toHaveBeenCalledWith(event);
    expect(observer).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toBe(event);
    expect(observer.mock.calls[0][0]).toBe(event);
    expect(onPress).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
    expect(action).toHaveBeenCalledTimes(1);
  });
  it('passes the exact real press event and observers before guarded close', async () => {
    const ref = React.createRef<View>();
    const events: unknown[] = [];
    const order: string[] = [];
    const onTap = jest.fn();
    const onNamedAction = jest.fn();
    const { result, scope } = await entry({
      itemId: 'press',
      content: 'Press',
      ref,
      onAction: (event) => {
        events.push(event);
        order.push('action');
      },
      onPress: (event) => {
        events.push(event);
        order.push('press');
      },
      onAccessibilityTap: onTap,
      onAccessibilityAction: onNamedAction,
    });
    if (!ref.current) throw new Error('MenuEntry press fixture requires its actual native row.');
    jest.spyOn(scope, 'action').mockImplementation(() => {
      order.push('close');
    });
    await fireEvent.press(result.getByRole('menuitem'));
    expect(events).toHaveLength(2);
    expect(events[0]).toBe(events[1]);
    expect(events[0]).toMatchObject({ nativeEvent: expect.any(Object), isDefaultPrevented: expect.any(Function) });
    expect(order).toEqual(['action', 'press', 'close']);
    expect(onTap).not.toHaveBeenCalled();
    expect(onNamedAction).not.toHaveBeenCalled();
  });
  it('calls the command with undefined then its native tap observer once before close', async () => {
    const calls: string[] = [];
    const onAction = jest.fn((event: Parameters<NonNullable<MenuEntryProps['onAction']>>[0]) => {
      expect(event).toBeUndefined();
      calls.push('action');
    });
    const onTap = jest.fn(() => {
      calls.push('tap');
    });
    const onPress = jest.fn();
    const onNamedAction = jest.fn();
    const { result, scope } = await entry({
      itemId: 'ax',
      content: 'AX command',
      onAction,
      onPress,
      onAccessibilityTap: onTap,
      onAccessibilityAction: onNamedAction,
    });
    jest.spyOn(scope, 'action').mockImplementation(() => {
      calls.push('close');
    });
    await act(() => result.getByRole('menuitem').props.onAccessibilityTap());
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(undefined);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['action', 'tap', 'close']);
    expect(onPress).not.toHaveBeenCalled();
    expect(onNamedAction).not.toHaveBeenCalled();
  });
  it.each([
    ['checkbox', false],
    ['checkbox', true],
    ['radio', false],
    ['radio', true],
  ] as const)('eventless %s activation requests external choice from selected=%s without changing it', async (checkable, selected) => {
    const onAction = jest.fn();
    const onTap = jest.fn();
    const props: MenuEntryProps =
      checkable === 'radio'
        ? { itemId: 'choice', content: 'Choice', checkable, selectionGroup: 'choice', selected, onAction, onAccessibilityTap: onTap }
        : { itemId: 'choice', content: 'Choice', checkable, selected, onAction, onAccessibilityTap: onTap };
    const { result, action } = await entry(props);
    const root = result.getByRole(checkable === 'radio' ? 'menuitemradio' : 'menuitemcheckbox');
    await act(() => root.props.onAccessibilityTap());
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(undefined);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(root.props.accessibilityState.checked).toBe(selected);
  });
  it('eventless submenu activation requests open and forwards only its original tap observer', async () => {
    const onTap = jest.fn();
    const onPress = jest.fn();
    const { result, open, action } = await entry({
      itemId: 'submenu-ax',
      content: 'More',
      submenu: { surfaceAccessibilityLabel: 'More' },
      onAccessibilityTap: onTap,
      onPress,
    });
    await act(() => result.getByRole('menuitem').props.onAccessibilityTap());
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('submenu-ax');
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
  it.each([false, true])('preserves disabled eventless tap observers with submenu=%s', async (submenu) => {
    const onTap = jest.fn();
    const onAction = jest.fn();
    const props: MenuEntryProps = submenu
      ? {
          itemId: 'disabled-ax',
          content: 'More',
          disabled: true,
          submenu: { surfaceAccessibilityLabel: 'More' },
          onAccessibilityTap: onTap,
        }
      : { itemId: 'disabled-ax', content: 'Command', disabled: true, onAction, onAccessibilityTap: onTap };
    const { result, open, action } = await entry(props);
    await act(() => result.getByRole('menuitem').props.onAccessibilityTap());
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledWith();
    expect(onAction).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
  it('preserves eventless observers without acting through a stale presentation', async () => {
    const onTap = jest.fn();
    const onAction = jest.fn();
    const { result, scope, action } = await entry({ itemId: 'stale-ax', content: 'Stale', onAction, onAccessibilityTap: onTap });
    jest.spyOn(scope, 'canInvoke').mockReturnValue(false);
    await act(() => result.getByRole('menuitem').props.onAccessibilityTap());
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
  it('keeps disabled entries announced but nonfocusable and forwards disabled/custom action observers', async () => {
    const observer = jest.fn();
    const onAction = jest.fn();
    const { result, action } = await entry({
      itemId: 'disabled',
      content: 'Disabled',
      disabled: true,
      onAction,
      onAccessibilityAction: observer,
    });
    const root = result.getByRole('menuitem');
    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    await act(() => root.props.onAccessibilityAction({ nativeEvent: { actionName: 'Custom' } }));
    expect(observer).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
  it('owns submenu expansion without invoking a root command', async () => {
    const { result, open, action } = await entry({ itemId: 'more', content: 'More', submenu: { surfaceAccessibilityLabel: 'More' } });
    const root = result.getByRole('menuitem');
    expect(root.props.accessibilityState.expanded).toBe(false);
    expect(root.props.accessibilityHint).toBe('Has submenu');
    await fireEvent.press(root);
    expect(open).toHaveBeenCalledWith('more');
    expect(action).not.toHaveBeenCalled();
  });
  it('keeps one leaf target, native ring, caller styles and callback cleanup', async () => {
    const cleanup = jest.fn();
    const ref = jest.fn(() => cleanup);
    const { result } = await entry({ itemId: 'root', content: 'Root', ref, style: { minHeight: 75 }, secondaryContent: null });
    const root = result.getByRole('menuitem');
    expect(root.props.enableFocusRing).toBe(true);
    expect(StyleSheet.flatten(root.props.style).minHeight).toBe(75);
    expect(root.props.keyDownEvents.map((item: { key: string }) => item.key)).not.toContain('Tab');
    expect(ref).toHaveBeenCalledTimes(1);
    await result.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
  it('forwards leaf hover as visual/observer input without inventing a focus target', async () => {
    const observer = jest.fn();
    const { result, action, open } = await entry({ itemId: 'hover', content: 'Hover', onHoverIn: observer });
    await fireEvent(result.getByRole('menuitem'), 'hoverIn', { nativeEvent: {} });
    expect(observer).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
  it('rejects standalone adapters and invalid identities explicitly', async () => {
    await expect(render(<MenuEntry itemId="one" content="One" />)).rejects.toThrow('Menu owner');
    await expect(entry({ itemId: '', content: 'Missing identity' })).rejects.toThrow('itemId');
  });
});

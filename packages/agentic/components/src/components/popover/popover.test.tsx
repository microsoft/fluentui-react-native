/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { Pressable } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { act, fireEvent, renderHook } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { RootInputBoundary, useRootInputModality, useRootSettings, useThemeState } from '@fluentui-react-native/design';
import { directComponent } from '@fluentui-react-native/framework-base';

import { render } from '../../common/renderWithTheme';
import { Popover } from './popover';
import type { PopoverProps } from './popover.types';
import { usePopoverAnchor } from './usePopoverAnchor';
import { usePopover_unstable } from './usePopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import { renderPopover_unstable } from './renderPopover';

jest.mock('@fluentui-react-native/callout', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const { phasedComponent, directComponent } = jest.requireActual('@fluentui-react-native/framework-base');
  const mounted = jest.fn();
  const detached = jest.fn();
  return {
    mounted,
    detached,
    Callout: phasedComponent((props: object) => {
      React.useLayoutEffect(() => {
        mounted();
        return detached;
      }, []);
      return directComponent((renderProps: object) => React.createElement(View, { ...props, ...renderProps }));
    }),
  };
});

const callout: { mounted: jest.Mock; detached: jest.Mock } = jest.requireMock('@fluentui-react-native/callout');
const label = 'Sync details';
const trigger = (result: RenderResult) => result.getByTestId('popover-trigger');
const surface = (result: RenderResult) => result.getByTestId('popover-surface');
const host = (result: RenderResult) => result.getByTestId('popover-surface-content');
const expanded = (result: RenderResult) => trigger(result).props.accessibilityState.expanded;
const renderPopover = (props: PopoverProps = {}) => render(<Popover surfaceAccessibilityLabel={label} {...props} />);

describe('Popover', () => {
  beforeEach(() => {
    callout.mounted.mockClear();
    callout.detached.mockClear();
  });

  it('defaults to a passive wrapper and enabled closed trigger without running Callout hooks', async () => {
    const result = await renderPopover({ testID: 'root' });
    expect(trigger(result).props).toMatchObject({
      role: 'button',
      accessible: true,
      focusable: true,
      accessibilityState: { disabled: false, expanded: false },
    });
    expect(result.getByTestId('root').props).toMatchObject({ accessible: false, focusable: false });
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(callout.mounted).not.toHaveBeenCalled();
  });

  it('mounts and tears down actual host hook sessions on each uncontrolled open', async () => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ onOpenChange });
    await fireEvent.press(trigger(result));
    expect(expanded(result)).toBe(true);
    expect(surface(result).props.directionalHint).toBe('bottomLeftEdge');
    expect(surface(result).props.setInitialFocus).toBe(true);
    expect(surface(result).props.target.current).not.toBeNull();
    expect(result.getByText('Popover content')).toBeOnTheScreen();
    expect(callout.mounted).toHaveBeenCalledTimes(1);
    await fireEvent.press(trigger(result));
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(callout.detached).toHaveBeenCalledTimes(1);
    await fireEvent.press(trigger(result));
    expect(callout.mounted).toHaveBeenCalledTimes(2);
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('starts defaultOpen only after the trigger has committed a live anchor', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const result = await renderPopover({ defaultOpen: true, trigger: { ref } });
    expect(expanded(result)).toBe(true);
    expect(surface(result).props.target.current).toBe(ref.current);
    expect(callout.mounted).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('preserves controlled open=%s and ignores defaultOpen', async (open) => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ open, defaultOpen: !open, onOpenChange });
    expect(expanded(result)).toBe(open);
    await fireEvent.press(trigger(result));
    expect(expanded(result)).toBe(open);
    expect(onOpenChange.mock.calls).toEqual([[!open]]);
  });

  it('guards disabled press and actions, but closes an already-open disabled host on dismiss', async () => {
    const onPress = jest.fn();
    const observer = jest.fn();
    const onOpenChange = jest.fn();
    const result = await renderPopover({
      defaultOpen: true,
      disabled: true,
      onOpenChange,
      trigger: { onPress, onAccessibilityAction: observer },
    });
    expect(trigger(result)).toBeDisabled();
    expect(trigger(result).props.focusable).toBe(false);
    await fireEvent.press(trigger(result));
    await act(() => {
      trigger(result).props.onAccessibilityAction({ nativeEvent: { actionName: 'Collapse' } });
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
    expect(observer).toHaveBeenCalledTimes(1);
    await fireEvent(surface(result), 'dismiss');
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(result.queryByTestId('popover-surface')).toBeNull();
  });

  it('reports a controlled dismissal once without mutating requested open', async () => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ open: true, onOpenChange });
    const dismiss = surface(result).props.onDismiss;
    await act(() => {
      dismiss();
      dismiss();
    });
    expect(expanded(result)).toBe(true);
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it.each(['windows', 'win32', 'macos'])('resolves exact %s actions, preserving labels and original events once', async (platform) => {
    const os = jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    try {
      const onOpenChange = jest.fn();
      const onAccessibilityAction = jest.fn();
      const onPress = jest.fn();
      const result = await renderPopover({
        onOpenChange,
        trigger: {
          onPress,
          onAccessibilityAction,
          accessibilityActions: [
            { name: 'expand', label: 'Show details' },
            { name: 'Expand', label: 'Duplicate' },
            { name: 'collapse', label: 'Hide details' },
            { name: 'Collapse' },
            { name: 'help', label: 'Help' },
          ],
        },
      });
      const expand = platform === 'windows' ? 'expand' : 'Expand';
      const collapse = platform === 'windows' ? 'collapse' : 'Collapse';
      expect(trigger(result).props.accessibilityActions).toEqual([
        { name: expand, label: 'Show details' },
        { name: collapse, label: 'Hide details' },
        { name: 'help', label: 'Help' },
      ]);
      for (const name of [expand, expand, 'invoke', 'activate', 'help', collapse, collapse]) {
        const event = { nativeEvent: { actionName: name } };
        await fireEvent(trigger(result), 'accessibilityAction', event);
        expect(onAccessibilityAction).toHaveBeenLastCalledWith(event);
      }
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(onAccessibilityAction).toHaveBeenCalledTimes(7);
      expect(onPress).not.toHaveBeenCalled();
      await fireEvent(trigger(result), 'accessibilityAction', {
        nativeEvent: { actionName: platform === 'windows' ? 'Expand' : 'expand' },
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    } finally {
      os.restore();
    }
  });

  it('forwards the genuine press after the owned request and preserves unrelated state', async () => {
    const trace: string[] = [];
    const result = await renderPopover({
      onOpenChange: (value) => trace.push(`open:${value}`),
      accessibilityState: { busy: true },
      trigger: { children: <Text>Details</Text>, onPress: () => trace.push('press'), accessibilityLabel: 'Show details' },
    });
    expect(trigger(result).props.accessibilityState).toEqual({ busy: true, disabled: false, expanded: false });
    expect(trigger(result).props.accessibilityLabel).toBe('Show details');
    await fireEvent.press(trigger(result));
    expect(trace).toEqual(['open:true', 'press']);
    expect(host(result).props.accessibilityLabel).toBe(label);
    expect(host(result).props.role).toBe('dialog');
  });

  it('suppresses already-satisfied uncontrolled action requests within one event batch', async () => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ onOpenChange });
    const onAction = trigger(result).props.onAccessibilityAction;
    const expand = trigger(result).props.accessibilityActions.find(
      (action: { name: string }) => action.name.toLowerCase() === 'expand',
    ).name;
    const collapse = trigger(result).props.accessibilityActions.find(
      (action: { name: string }) => action.name.toLowerCase() === 'collapse',
    ).name;
    await act(() => {
      onAction({ nativeEvent: { actionName: expand } });
      onAction({ nativeEvent: { actionName: expand } });
      onAction({ nativeEvent: { actionName: collapse } });
      onAction({ nativeEvent: { actionName: collapse } });
    });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(expanded(result)).toBe(false);
  });

  it('preserves native style and children callbacks with caller styles after structural styles', async () => {
    const result = await renderPopover({
      trigger: {
        style: ({ pressed }) => ({ width: pressed ? 140 : 120 }),
        children: ({ pressed }) => <Text>{pressed ? 'Pressed details' : 'Details'}</Text>,
      },
    });
    expect(result.getByText('Details')).toBeOnTheScreen();
    await fireEvent(trigger(result), 'pressIn', { nativeEvent: {} });
    expect(result.getByText('Pressed details')).toBeOnTheScreen();
    const style = trigger(result).props.style;
    expect(StyleSheet.flatten(typeof style === 'function' ? style({ pressed: true }) : style)).toMatchObject({
      width: 140,
      flexDirection: 'row',
    });
  });

  it('uses native macOS keydown activation once and cancels release feedback on blur', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'macos');
    try {
      const onOpenChange = jest.fn();
      const onPressOut = jest.fn();
      const result = await renderPopover({ open: false, onOpenChange, trigger: { onPressOut } });
      const key = (value: string) => ({
        nativeEvent: { key: value, code: value === ' ' ? 'Space' : value },
        target: 1,
        currentTarget: 1,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
        stopPropagation: jest.fn(),
      });
      await fireEvent(trigger(result), 'keyDown', key(' '));
      await fireEvent(trigger(result), 'keyDown', key(' '));
      expect(onOpenChange.mock.calls).toEqual([[true]]);
      await fireEvent(trigger(result), 'blur', { target: 1, currentTarget: 1 });
      await fireEvent(trigger(result), 'keyUp', key(' '));
      expect(onPressOut).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    } finally {
      platform.restore();
    }
  });

  it.each([
    'leftTopEdge',
    'leftCenter',
    'leftBottomEdge',
    'topLeftEdge',
    'topAutoEdge',
    'topCenter',
    'topRightEdge',
    'rightTopEdge',
    'rightCenter',
    'rightBottomEdge',
    'bottomLeftEdge',
    'bottomAutoEdge',
    'bottomCenter',
    'bottomRightEdge',
  ] as const)('forwards the preferred %s hint without creating another public variant', async (position) => {
    const result = await renderPopover({ defaultOpen: true, position });
    expect(surface(result).props.directionalHint).toBe(position);
  });

  it('retains the first content host measurement floor and token boundary with user styles last', async () => {
    const result = await renderPopover({
      defaultOpen: true,
      style: { width: 280 },
      testID: 'root',
      trigger: { style: { width: 120 } },
      content: { style: { maxWidth: 240, padding: 3 }, children: <Text>Content that can wrap</Text> },
    });
    expect(StyleSheet.flatten(host(result).props.style)).toMatchObject({
      minWidth: 200,
      overflow: 'hidden',
      backgroundColor: defaultFlexTokens.color.surfaceNeutralNearer,
      borderColor: defaultFlexTokens.color.strokeNeutralSubtle,
      borderRadius: defaultFlexTokens.borderRadius.base400,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
      padding: defaultFlexTokens.spacing.componentBase400,
    });
    expect(host(result).props.collapsable).toBe(false);
    expect(StyleSheet.flatten(result.getByTestId('root').props.style)).toMatchObject({ alignSelf: 'flex-start', width: 280 });
    expect(StyleSheet.flatten(trigger(result).props.style)).toMatchObject({ width: 120 });
    expect(StyleSheet.flatten(result.getByTestId('popover-content').props.style)).toMatchObject({ maxWidth: 240, padding: 3 });
    expect(result.getByText('Content that can wrap').props.numberOfLines).toBeUndefined();
  });

  it('accepts compatible content replacement and null empty content without remounting the host', async () => {
    const replacement = directComponent<React.ComponentProps<typeof View>>((props) => <View {...props} accessibilityHint="replacement" />);
    const result = await renderPopover({
      defaultOpen: true,
      content: { as: replacement, testID: 'replacement', children: <Text>Custom</Text> },
    });
    expect(result.getByTestId('replacement').props.accessibilityHint).toBe('replacement');
    expect(result.queryByText('Popover content')).toBeNull();
    await result.rerender(<Popover defaultOpen surfaceAccessibilityLabel={label} content={null} />);
    expect(host(result)).toBeOnTheScreen();
    expect(result.queryByTestId('popover-content')).toBeNull();
    expect(callout.mounted).toHaveBeenCalledTimes(1);
  });

  it('forwards distinct root, trigger and content refs and cleans them on unmount', async () => {
    const root = React.createRef<View>();
    const control = React.createRef<React.ComponentRef<typeof Pressable>>();
    const content = React.createRef<View>();
    const result = await renderPopover({ defaultOpen: true, ref: root, trigger: { ref: control }, content: { ref: content } });
    expect(root.current).not.toBeNull();
    expect(control.current).not.toBe(root.current);
    expect(content.current).not.toBe(root.current);
    expect(surface(result).props.target.current).toBe(control.current);
    await result.unmount();
    expect(root.current).toBeNull();
    expect(control.current).toBeNull();
    expect(content.current).toBeNull();
  });

  it('preserves a same-host callback handoff and React 19 consumer cleanup without host churn', async () => {
    const firstCleanup = jest.fn();
    const secondCleanup = jest.fn();
    const first = jest.fn((_instance: React.ComponentRef<typeof Pressable> | null) => firstCleanup);
    const second = jest.fn((_instance: React.ComponentRef<typeof Pressable> | null) => secondCleanup);
    const result = await renderPopover({ defaultOpen: true, trigger: { ref: first } });
    const target = surface(result).props.target;
    await result.rerender(<Popover defaultOpen surfaceAccessibilityLabel={label} trigger={{ ref: second }} />);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(surface(result).props.target).toBe(target);
    expect(second).toHaveBeenCalledWith(first.mock.calls[0][0]);
    expect(callout.mounted).toHaveBeenCalledTimes(1);
    await result.unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
  });

  it('ignores a dismissed session after close/reopen and after component unmount', async () => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ defaultOpen: true, onOpenChange });
    const stale = surface(result).props.onDismiss;
    await fireEvent.press(trigger(result));
    await fireEvent.press(trigger(result));
    await act(() => stale());
    expect(expanded(result)).toBe(true);
    const latest = surface(result).props.onDismiss;
    await result.unmount();
    await act(() => latest());
    expect(onOpenChange.mock.calls).toEqual([[false], [true]]);
  });

  it('uses RootInputBoundary in the existing theme and scene without changing observer event identity', async () => {
    const snapshots: { settings: ReturnType<typeof useRootSettings>; theme: ReturnType<typeof useThemeState> }[] = [];
    function Probe() {
      snapshots.push({ settings: useRootSettings(), theme: useThemeState() });
      return <Text testID="modality">{useRootInputModality()}</Text>;
    }
    const result = await render(
      <View>
        <Probe />
        <Popover defaultOpen surfaceAccessibilityLabel={label} content={{ children: <Probe /> }} />
      </View>,
    );
    expect(snapshots[0].settings).toBe(snapshots[1].settings);
    expect(snapshots[0].theme).toBe(snapshots[1].theme);
    await fireEvent(host(result), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    expect(result.getAllByTestId('modality').map((node) => node.props.children)).toEqual(['keyboard', 'keyboard']);
    await fireEvent(host(result), 'pointerDownCapture', {});
    expect(result.getAllByTestId('modality').map((node) => node.props.children)).toEqual(['pointer', 'pointer']);
    const observer = jest.fn();
    const event = { nativeEvent: { key: 'ArrowDown' } };
    const boundary = await render(<RootInputBoundary testID="boundary" onKeyDownCapture={observer} />);
    await fireEvent(boundary.getByTestId('boundary'), 'keyDownCapture', event);
    expect(observer).toHaveBeenCalledWith(event);
  });

  it.each(['windows', 'macos', 'win32'])('uses the shared %s ring policy on the actual self-focus target', async (platform) => {
    const os = jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    try {
      const result = await renderPopover();
      expect(trigger(result).props.enableFocusRing).toBe(platform !== 'win32');
      await fireEvent(trigger(result), 'focus', { target: 2, currentTarget: 1 });
      if (platform === 'win32') {
        const ring = () => StyleSheet.flatten(result.getByTestId('focus-visual', { includeHiddenElements: true }).props.style);
        expect(ring().opacity).toBe(0);
        await fireEvent(result.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
        await fireEvent(trigger(result), 'focus', { target: 1, currentTarget: 1 });
        expect(ring().opacity).not.toBe(0);
        expect(ring().borderColor).toBe(defaultFlexTokens.color.strokeFocusOuter);
        await fireEvent(trigger(result), 'blur', { target: 1, currentTarget: 1 });
        expect(ring().opacity).toBe(0);
      } else {
        expect(result.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
      }
    } finally {
      os.restore();
    }
  });

  it('keeps user test identifiers, preferred hints, and theme caches across ordinary rerenders', async () => {
    const result = await renderPopover({ defaultOpen: true, position: 'topRightEdge', trigger: { testID: 'custom-trigger' } });
    expect(result.getByTestId('custom-trigger')).toBeOnTheScreen();
    expect(surface(result).props.directionalHint).toBe('topRightEdge');
    const create = jest.spyOn(StyleSheet, 'create');
    await result.rerender(
      <Popover defaultOpen position="rightCenter" surfaceAccessibilityLabel={label} trigger={{ testID: 'custom-trigger' }} />,
    );
    expect(surface(result).props.directionalHint).toBe('rightCenter');
    expect(create).not.toHaveBeenCalled();
    expect(callout.mounted).toHaveBeenCalledTimes(1);
    create.mockRestore();
  });

  it('warns for a missing surface name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await render(<Popover />);
    expect(warn).toHaveBeenCalledWith('Popover: provide a surfaceAccessibilityLabel to name the floating surface.');
    warn.mockRestore();
  });

  it('does not paint focus from an unsupported focused prop or expose restoration callbacks', async () => {
    const result = await renderPopover({ defaultOpen: true });
    expect(surface(result).props.onRestoreFocus).toBeUndefined();
    expect(surface(result).props.componentRef).toBeUndefined();
    expect(surface(result).props.dismissBehaviors).toBeUndefined();
    expect(surface(result).props.isBeakVisible).toBeUndefined();
  });
});

describe('Popover committed anchor', () => {
  beforeEach(() => {
    callout.mounted.mockClear();
    callout.detached.mockClear();
  });

  it('coalesces same-host handoffs, rejects stale cleanup, and creates a new target for replacement', async () => {
    const onDetach = jest.fn();
    const hook = await renderHook(() => usePopoverAnchor(onDetach));
    const firstRef = React.createRef<View>();
    const secondRef = React.createRef<View>();
    await render(
      <View>
        <View ref={firstRef} />
        <View ref={secondRef} />
      </View>,
    );
    const first = firstRef.current;
    const second = secondRef.current;
    let cleanup: void | (() => void);
    await act(() => {
      cleanup = hook.result.current.anchorRef(first);
    });
    const anchor = hook.result.current.anchor;
    await act(() => {
      if (typeof cleanup === 'function') cleanup();
      hook.result.current.anchorRef(first);
    });
    expect(hook.result.current.anchor).toBe(anchor);
    expect(onDetach).not.toHaveBeenCalled();
    await act(() => {
      hook.result.current.anchorRef(second);
    });
    expect(hook.result.current.anchor?.target.current).toBe(second);
    expect(hook.result.current.anchor?.generation).not.toBe(anchor?.generation);
    await act(() => {
      if (typeof cleanup === 'function') cleanup();
    });
    expect(hook.result.current.liveAnchor.current).toBe(second);
    await act(() => {
      hook.result.current.anchorRef(null);
    });
    expect(hook.result.current.anchor).toBeNull();
    expect(onDetach).toHaveBeenCalledTimes(1);
  });

  it('invalidates the rendered host on genuine replacement and requests close on genuine detach', async () => {
    let state: ReturnType<typeof usePopover_unstable>;
    const onOpenChange = jest.fn();
    function Scene() {
      state = usePopover_unstable({ defaultOpen: true, onOpenChange, surfaceAccessibilityLabel: label });
      return renderPopover_unstable(state, usePopoverStyles_unstable(state));
    }
    const result = await render(<Scene />);
    const stale = surface(result).props.onDismiss;
    const replacement = React.createRef<View>();
    await render(<View ref={replacement} />);
    await act(() => {
      state.anchorRef(replacement.current);
    });
    expect(surface(result).props.target.current).toBe(replacement.current);
    expect(callout.detached).toHaveBeenCalled();
    await act(() => stale());
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(() => {
      state.anchorRef(null);
    });
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it('does not request a state change from anchor cleanup after component unmount', async () => {
    const onOpenChange = jest.fn();
    const result = await renderPopover({ defaultOpen: true, onOpenChange });
    await result.unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

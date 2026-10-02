/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { Pressable } from 'react-native';
import { Platform, View } from 'react-native';
import { act, fireEvent, renderHook } from '@testing-library/react-native';
import type { CalloutHandle, CalloutProps, CalloutReadyEvent, CalloutDismissContextEvent } from '@fluentui-react-native/callout';
import { useFocusTarget } from '@fluentui-react-native/framework-base';

import { render } from '../../common/renderWithTheme';
import { usePopover_unstable } from './usePopover';
import { renderPopover_unstable } from './renderPopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import type { PopoverProps, PopoverMenuHostOptions, PopoverMenuHostBinding, PopoverCommittedAnchor } from './popover.types';
import { nativeEvent } from './popover.native-events.test-helpers';

jest.mock('@fluentui-react-native/callout', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const handle = {
    focusWindow: jest.fn(),
    blurWindow: jest.fn(),
    focusInitialChild: jest.fn(),
    focusOwnedChild: jest.fn(),
    closeOwned: jest.fn(),
  };
  const mounted = jest.fn();
  const detached = jest.fn();
  return {
    handle,
    mounted,
    detached,
    Callout: (props: CalloutProps) => {
      React.useImperativeHandle(props.componentRef, () => handle, []);
      React.useLayoutEffect(() => {
        mounted();
        return detached;
      }, []);
      return React.createElement(View, props);
    },
  };
});
const native: { handle: CalloutHandle; mounted: jest.Mock; detached: jest.Mock } = jest.requireMock('@fluentui-react-native/callout');
function Composed({
  props,
  host,
  attachment,
}: {
  props: PopoverProps;
  host: PopoverMenuHostOptions;
  attachment?: PopoverCommittedAnchor | null;
}) {
  const { trigger, ...externalProps } = props;
  if (attachment !== undefined && trigger !== undefined) throw new Error('External fixture cannot supply a trigger.');
  return attachment === undefined ? (
    <TriggerComposed props={props} host={host} />
  ) : (
    <ExternalComposed props={externalProps} host={host} attachment={attachment} />
  );
}
function TriggerComposed({ props, host }: { props: PopoverProps; host: PopoverMenuHostOptions }) {
  const state = usePopover_unstable(props, { host });
  return renderPopover_unstable(state, usePopoverStyles_unstable(state));
}
function ExternalComposed({
  props,
  host,
  attachment,
}: {
  props: PopoverProps & { trigger?: never };
  host: PopoverMenuHostOptions;
  attachment: PopoverCommittedAnchor | null;
}) {
  const state = usePopover_unstable(props, { host, anchor: { mode: 'external', attachment } });
  return renderPopover_unstable(state, usePopoverStyles_unstable(state));
}
const ready = (generation = 'native-1'): CalloutReadyEvent => nativeEvent({ generation });
const context = (reason: CalloutDismissContextEvent['nativeEvent']['reason'] = 'escape') =>
  nativeEvent({ generation: 'native-1', reason, returnFocus: 'not-requested' });

async function registeredTarget(instance: View | null) {
  const hook = await renderHook(() => useFocusTarget());
  const attach = (next: View | null) => {
    const cleanup = hook.result.current.focusTargetRef(next);
    return typeof cleanup === 'function'
      ? cleanup
      : () => {
          hook.result.current.focusTargetRef(null);
        };
  };
  let cleanup: () => void = () => undefined;
  await act(() => {
    cleanup = attach(instance);
  });
  return { lifetime: hook.result.current.focusTarget, attach, cleanup };
}

describe('Popover composition', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'macos');
    native.mounted.mockClear();
    native.detached.mockClear();
  });
  afterEach(() => jest.restoreAllMocks());

  it('binds actual mounted methods, owner focus policy, and original ready/pointer events', async () => {
    const binding = React.createRef<PopoverMenuHostBinding>();
    const onReady = jest.fn();
    const onPointerMove = jest.fn();
    const host: PopoverMenuHostOptions = {
      policy: 'menu-macos',
      initialFocus: 'owner',
      presentationKey: 1,
      bindingRef: binding,
      onReady,
      onPointerMove,
    };
    const result = await render(<Composed props={{ defaultOpen: true, surfaceAccessibilityLabel: 'Menu' }} host={host} />);
    const popup = result.getByTestId('popover-surface');
    expect(popup.props.menuFocusManagement).toBe(true);
    expect(popup.props.setInitialFocus).toBe(false);
    expect(popup.props.onRestoreFocus).toBeUndefined();
    expect(binding.current?.getCurrent()?.phase).toBe('mounted');
    const event = ready();
    await fireEvent(popup, 'ready', event);
    expect(binding.current?.getCurrent()).toMatchObject({ phase: 'ready', nativeGeneration: 'native-1' });
    expect(onReady).toHaveBeenCalledWith(event, binding.current);
    const pointer = { nativeEvent: { generation: 'native-1', pointerId: 'mouse', screenX: 10, screenY: 20, targetTag: 0 } };
    await fireEvent(popup, 'menuPointerMove', pointer);
    expect(onPointerMove).toHaveBeenCalledWith(pointer, binding.current);
    expect(native.handle.focusInitialChild).not.toHaveBeenCalled();
  });

  it('latches controlled true after context and delivers legacy once before intentional rearm', async () => {
    const binding = React.createRef<PopoverMenuHostBinding>();
    const onOpenChange = jest.fn(),
      onDismiss = jest.fn(),
      onDismissContext = jest.fn();
    const host: PopoverMenuHostOptions = {
      policy: 'menu-macos',
      initialFocus: 'owner',
      presentationKey: 1,
      bindingRef: binding,
      onDismiss,
      onDismissContext,
    };
    const props = { open: true, surfaceAccessibilityLabel: 'Menu', onOpenChange };
    const result = await render(<Composed props={props} host={host} />);
    await fireEvent(result.getByTestId('popover-surface'), 'ready', ready());
    const lease = binding.current?.getCurrent()?.signal;
    const original = context();
    await fireEvent(result.getByTestId('popover-surface'), 'dismissContext', original);
    expect(lease?.aborted).toBe(true);
    expect(binding.current?.getCurrent()).toBeUndefined();
    expect(result.getByTestId('popover-surface')).toBeOnTheScreen();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onDismissContext).toHaveBeenCalledWith(original, binding.current);
    await result.rerender(<Composed props={props} host={{ ...host }} />);
    expect(native.mounted).toHaveBeenCalledTimes(1);
    const legacy = result.getByTestId('popover-surface').props.onDismiss;
    await act(() => {
      legacy();
      legacy();
    });
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(result.queryByTestId('popover-surface')).toBeNull();
    await result.rerender(<Composed props={props} host={host} />);
    expect(result.queryByTestId('popover-surface')).toBeNull();
    await result.rerender(<Composed props={props} host={{ ...host, presentationKey: 2 }} />);
    expect(native.mounted).toHaveBeenCalledTimes(2);
    await act(() => legacy());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('rearms on committed false then true and handles context-only teardown once', async () => {
    const onOpenChange = jest.fn(),
      onDismiss = jest.fn();
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1, onDismiss };
    const result = await render(<Composed props={{ open: true, surfaceAccessibilityLabel: 'Menu', onOpenChange }} host={host} />);
    await fireEvent(result.getByTestId('popover-surface'), 'dismissContext', context('host-detached'));
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(result.queryByTestId('popover-surface')).toBeNull();
    await result.rerender(<Composed props={{ open: false, surfaceAccessibilityLabel: 'Menu', onOpenChange }} host={host} />);
    await result.rerender(<Composed props={{ open: true, surfaceAccessibilityLabel: 'Menu', onOpenChange }} host={host} />);
    expect(native.mounted).toHaveBeenCalledTimes(2);
  });

  it('waits for a legacy terminal observer when a new intent arrives during native closing', async () => {
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 };
    const props = { open: true, surfaceAccessibilityLabel: 'Menu' };
    const result = await render(<Composed props={props} host={host} />);
    const popup = result.getByTestId('popover-surface');
    await fireEvent(popup, 'dismissContext', context());
    await result.rerender(<Composed props={props} host={{ ...host, presentationKey: 2 }} />);
    expect(native.mounted).toHaveBeenCalledTimes(1);
    await fireEvent(result.getByTestId('popover-surface'), 'dismiss');
    expect(native.mounted).toHaveBeenCalledTimes(2);
  });

  it('retains terminal transport when the context observer commits false and queues another open', async () => {
    const onDismiss = jest.fn();
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1, onDismiss };
    const result = await render(<Composed props={{ open: true, surfaceAccessibilityLabel: 'Menu' }} host={host} />);
    await fireEvent(result.getByTestId('popover-surface'), 'dismissContext', context());
    await result.rerender(<Composed props={{ open: false, surfaceAccessibilityLabel: 'Menu' }} host={host} />);
    expect(result.getByTestId('popover-surface')).toBeOnTheScreen();
    await result.rerender(<Composed props={{ open: true, surfaceAccessibilityLabel: 'Menu' }} host={host} />);
    expect(native.mounted).toHaveBeenCalledTimes(1);
    await fireEvent(result.getByTestId('popover-surface'), 'dismiss');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(native.mounted).toHaveBeenCalledTimes(2);
  });

  it('preserves root/trigger/content refs and callback binding handoffs without new native sessions', async () => {
    const root = React.createRef<View>(),
      trigger = React.createRef<React.ComponentRef<typeof Pressable>>(),
      content = React.createRef<View>();
    const firstCleanup = jest.fn(),
      secondCleanup = jest.fn();
    const first = jest.fn((_binding: PopoverMenuHostBinding | null) => firstCleanup);
    const second = jest.fn((_binding: PopoverMenuHostBinding | null) => secondCleanup);
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1, bindingRef: first };
    const props: PopoverProps = {
      defaultOpen: true,
      surfaceAccessibilityLabel: 'Menu',
      ref: root,
      trigger: { ref: trigger },
      content: { ref: content },
    };
    const result = await render(<Composed props={props} host={host} />);
    const oldRoot = root.current,
      oldTrigger = trigger.current;
    expect(root.current).not.toBe(trigger.current);
    expect(content.current).not.toBe(trigger.current);
    await result.rerender(<Composed props={props} host={{ ...host, bindingRef: second }} />);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(first.mock.calls[0][0]);
    expect(native.mounted).toHaveBeenCalledTimes(1);
    expect(root.current).toBe(oldRoot);
    expect(trigger.current).toBe(oldTrigger);
    await result.unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(root.current).toBeNull();
  });

  it('uses only the committed existing row, retaining root ref and zero duplicate trigger/ring', async () => {
    const row = React.createRef<View>();
    await render(<View ref={row} testID="row" />);
    const registration = await registeredTarget(row.current);
    const lifetime = registration.lifetime;
    let cleanup = registration.cleanup;
    const binding = React.createRef<PopoverMenuHostBinding>(),
      root = React.createRef<View>();
    const attachment: PopoverCommittedAnchor = { nativeRef: row, mountGeneration: lifetime.generation, lifetime };
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1, bindingRef: binding };
    const props: PopoverProps = { open: true, ref: root, surfaceAccessibilityLabel: 'Submenu', testID: 'child-root' };
    const result = await render(<Composed props={props} host={host} attachment={attachment} />);
    expect(result.queryByTestId('popover-trigger')).toBeNull();
    expect(result.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
    expect(result.getByTestId('popover-surface').props.target.current).toBe(row.current);
    expect(binding.current?.getCurrent()?.anchorMountGeneration).toBe(lifetime.generation);
    const originalRoot = root.current;
    await act(() => {
      cleanup();
      cleanup = registration.attach(row.current);
    });
    expect(native.mounted).toHaveBeenCalledTimes(1);
    expect(root.current).toBe(originalRoot);
    await act(() => {
      cleanup();
    });
    expect(binding.current?.getCurrent()).toBeUndefined();
    expect(result.queryByTestId('popover-surface')).toBeNull();
  });

  it('invalidates external replacement even with controlled true; stale original callbacks do nothing', async () => {
    const row = React.createRef<View>(),
      replacement = React.createRef<View>();
    await render(
      <View>
        <View ref={row} />
        <View ref={replacement} />
      </View>,
    );
    const registration = await registeredTarget(row.current);
    const lifetime = registration.lifetime;
    const onOpenChange = jest.fn(),
      onReady = jest.fn();
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1, onReady };
    const props = { open: true, surfaceAccessibilityLabel: 'Submenu', onOpenChange };
    const attachment = { nativeRef: row, mountGeneration: lifetime.generation, lifetime };
    const result = await render(<Composed props={props} host={host} attachment={attachment} />);
    const oldPopup = result.getByTestId('popover-surface');
    const lateReady = oldPopup.props.onReady,
      lateDismiss = oldPopup.props.onDismiss;
    const error = jest.spyOn(console, 'error').mockImplementation();
    await act(() => {
      registration.attach(replacement.current);
    });
    expect(error).toHaveBeenCalledWith('Popover: external anchor does not match its committed native instance and mount generation.');
    error.mockRestore();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(result.queryByTestId('popover-surface')).toBeNull();
    const fresh = { nativeRef: replacement, mountGeneration: lifetime.generation, lifetime };
    await result.rerender(<Composed props={props} host={host} attachment={fresh} />);
    expect(result.queryByTestId('popover-surface')).toBeNull();
    await act(() => {
      lateReady(ready());
      lateDismiss();
    });
    expect(onReady).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await result.rerender(<Composed props={props} host={{ ...host, presentationKey: 2 }} attachment={fresh} />);
    expect(native.mounted).toHaveBeenCalledTimes(2);
  });

  it('ignores external stale-generation input without a native host or duplicate trigger', async () => {
    const row = React.createRef<View>();
    await render(<View ref={row} />);
    const registration = await registeredTarget(row.current);
    const lifetime = registration.lifetime;
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 };
    const error = jest.spyOn(console, 'error').mockImplementation();
    const result = await render(
      <Composed
        props={{ open: true, surfaceAccessibilityLabel: 'Submenu' }}
        host={host}
        attachment={{ nativeRef: row, lifetime, mountGeneration: lifetime.generation + 1 }}
      />,
    );
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(result.queryByTestId('popover-trigger')).toBeNull();
    expect(error).toHaveBeenCalledWith('Popover: external anchor does not match its committed native instance and mount generation.');
    error.mockRestore();
  });

  it('waits for external committed attachment without manufacturing an anchor', async () => {
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 };
    const result = await render(<Composed props={{ open: true, surfaceAccessibilityLabel: 'Submenu' }} host={host} attachment={null} />);
    expect(result.queryByTestId('popover-trigger')).toBeNull();
    expect(result.queryByTestId('popover-surface')).toBeNull();
    expect(native.mounted).not.toHaveBeenCalled();
  });

  it('invalidates a replaced lifetime witness even when the native object and numeric generation match', async () => {
    const row = React.createRef<View>();
    await render(<View ref={row} />);
    const first = await registeredTarget(row.current);
    const second = await registeredTarget(row.current);
    expect(first.lifetime.generation).toBe(second.lifetime.generation);
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 };
    const onOpenChange = jest.fn();
    const props = { open: true, surfaceAccessibilityLabel: 'Submenu', onOpenChange };
    const result = await render(
      <Composed
        props={props}
        host={host}
        attachment={{ nativeRef: row, mountGeneration: first.lifetime.generation, lifetime: first.lifetime }}
      />,
    );
    await result.rerender(
      <Composed
        props={props}
        host={host}
        attachment={{ nativeRef: row, mountGeneration: second.lifetime.generation, lifetime: second.lifetime }}
      />,
    );
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(result.queryByTestId('popover-surface')).toBeNull();
  });

  it.each(['windows', 'win32'])('rejects %s managed composition without sending new transport', async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const host: PopoverMenuHostOptions = { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 };
    await expect(render(<Composed props={{ surfaceAccessibilityLabel: 'Menu' }} host={host} />)).rejects.toThrow('macOS');
    expect(native.mounted).not.toHaveBeenCalled();
  });
});

import * as React from 'react';
import type { NativeSyntheticEvent } from 'react-native';

import { createMenuFocusManagement, isDismissContextEvent, isMenuPointerMoveEvent } from '../menuFocusManagement';
import type { ManagedOperationResult } from '../menuFocusManagement';

const nativeEvent = <T>(payload: T) => ({ nativeEvent: payload }) as NativeSyntheticEvent<T>;

function setup(family = false) {
  const dispatchFocus = jest.fn(() => true);
  const dispatchClose = jest.fn(() => true);
  const dispatchOwnedFocus = jest.fn(() => true);
  const manager = createMenuFocusManagement(dispatchFocus, dispatchClose, family ? dispatchOwnedFocus : undefined);
  const target = { current: new React.Component({}) };
  manager.setEnabled(true);
  manager.onReady('presentation-1');
  const result = (overrides: Partial<ManagedOperationResult> = {}): ManagedOperationResult => ({
    generation: 'presentation-1',
    requestId: '1',
    operation: 'initial-focus',
    status: 'confirmed',
    returnFocus: 'not-requested',
    ...overrides,
  });
  return { manager, dispatchFocus, dispatchClose, dispatchOwnedFocus, target, result };
}

describe('Callout managed focus bridge', () => {
  it('does not confirm focus from a void native dispatch', async () => {
    const { manager, dispatchFocus, target, result } = setup();
    const resolved = jest.fn();
    const request = manager.focusInitialChild('presentation-1', target);
    void request.then(resolved);
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();
    expect(dispatchFocus).toHaveBeenCalledWith('presentation-1', '1', target.current);
    manager.onResult(result());
    await expect(request).resolves.toEqual({ status: 'confirmed' });
  });

  it.each(['not-focusable', 'inactive-window', 'focus-moved', 'failed'] as const)('preserves native %s results', async (status) => {
    const { manager, target, result } = setup();
    const request = manager.focusInitialChild('presentation-1', target);
    manager.onResult(result({ status }));
    await expect(request).resolves.toMatchObject({ status });
  });

  it('rejects detached targets and stale presentation requests before dispatch', async () => {
    const { manager, dispatchFocus, target } = setup();
    await expect(manager.focusInitialChild('old', target)).resolves.toMatchObject({ status: 'cancelled' });
    await expect(manager.focusInitialChild('presentation-1', { current: null })).resolves.toMatchObject({ status: 'not-mounted' });
    expect(dispatchFocus).not.toHaveBeenCalled();
  });

  it('does not confirm a replaced ref from a late native result', async () => {
    const { manager, target, result } = setup();
    const request = manager.focusInitialChild('presentation-1', target);
    target.current = new React.Component({});
    manager.onResult(result());
    await expect(request).resolves.toMatchObject({ status: 'cancelled' });
  });

  it('cancels pending work on genuine host replacement and ignores old events', async () => {
    const { manager, target, result } = setup();
    const first = manager.focusInitialChild('presentation-1', target);
    manager.onReady('presentation-2');
    await expect(first).resolves.toMatchObject({ status: 'cancelled' });
    const second = manager.focusInitialChild('presentation-2', target);
    manager.onResult(result());
    manager.onDismiss('presentation-1');
    manager.onResult(result({ generation: 'presentation-2', requestId: '2' }));
    await expect(second).resolves.toMatchObject({ status: 'confirmed' });
  });

  it('cancels on native dismissal, detach, and disabling the protocol', async () => {
    const { manager, target } = setup();
    const first = manager.focusInitialChild('presentation-1', target);
    manager.onDismiss('presentation-1');
    await expect(first).resolves.toMatchObject({ status: 'cancelled' });
    manager.onReady('presentation-2');
    const second = manager.focusInitialChild('presentation-2', target);
    manager.detach();
    await expect(second).resolves.toMatchObject({ status: 'cancelled' });
    manager.onReady('presentation-3');
    const third = manager.focusInitialChild('presentation-3', target);
    manager.setEnabled(false);
    await expect(third).resolves.toMatchObject({ status: 'cancelled' });
    await expect(manager.closeOwned('presentation-3', 'action', true)).resolves.toMatchObject({ status: 'unsupported' });
  });

  it('distinguishes successful close from refused return', async () => {
    const { manager, dispatchClose, result } = setup();
    const request = manager.closeOwned('presentation-1', 'action', true);
    expect(dispatchClose).toHaveBeenCalledWith('presentation-1', '1', 'action', true);
    manager.onResult(result({ operation: 'close', returnFocus: 'focus-moved' }));
    await expect(request).resolves.toEqual({ status: 'confirmed', returnFocus: 'focus-moved' });
    manager.onDismiss('presentation-1');
  });

  it('returns explicit missing-native status and propagates command errors', async () => {
    const { manager, dispatchFocus, dispatchClose, target } = setup();
    dispatchFocus.mockReturnValue(false);
    await expect(manager.focusInitialChild('presentation-1', target)).resolves.toMatchObject({ status: 'not-mounted' });
    dispatchClose.mockImplementation(() => {
      throw new Error('native dispatch failed');
    });
    await expect(manager.closeOwned('presentation-1', 'programmatic', false)).rejects.toThrow('native dispatch failed');
  });

  it('surfaces invalid native results instead of confirming them', async () => {
    const { manager, target, result } = setup();
    const request = manager.focusInitialChild('presentation-1', target);
    expect(() => manager.onResult(result({ status: 'made-up-success' }))).toThrow('invalid managed operation result');
    await expect(request).resolves.toMatchObject({ status: 'failed' });
  });

  it.each(['keyboard', 'pointer', 'repair'] as const)('awaits exact native owned-child focus with %s intent', async (intent) => {
    const { manager, dispatchOwnedFocus, target, result } = setup(true);
    const settled = jest.fn();
    const request = manager.focusOwnedChild('presentation-1', target, intent);
    void request.then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    expect(dispatchOwnedFocus).toHaveBeenCalledWith('presentation-1', '1', target.current, intent);
    manager.onResult(result({ operation: 'owned-child-focus' }));
    await expect(request).resolves.toEqual({ status: 'confirmed' });
  });

  it('rejects family-only requests without dispatch while preserving the flat Windows protocol', async () => {
    const { manager, dispatchFocus, dispatchClose, dispatchOwnedFocus, target, result } = setup();
    await expect(manager.focusOwnedChild('presentation-1', target, 'repair')).resolves.toEqual({ status: 'unsupported' });
    await expect(manager.closeOwned('presentation-1', 'submenu-back', true)).resolves.toEqual({
      status: 'unsupported',
      returnFocus: 'not-requested',
    });
    expect(dispatchOwnedFocus).not.toHaveBeenCalled();
    expect(dispatchClose).not.toHaveBeenCalled();
    const request = manager.focusInitialChild('presentation-1', target);
    expect(dispatchFocus).toHaveBeenCalledTimes(1);
    manager.onResult(result());
    await expect(request).resolves.toEqual({ status: 'confirmed' });
    const close = manager.closeOwned('presentation-1', 'programmatic', false);
    expect(dispatchClose).toHaveBeenCalledWith('presentation-1', '2', 'programmatic', false);
    manager.onResult(result({ requestId: '2', operation: 'close' }));
    await expect(close).resolves.toEqual({ status: 'confirmed', returnFocus: 'not-requested' });
  });

  it('uses honest submenu-back and preserves the separately guarded return result', async () => {
    const { manager, dispatchClose, result } = setup(true);
    const request = manager.closeOwned('presentation-1', 'submenu-back', true);
    expect(dispatchClose).toHaveBeenCalledWith('presentation-1', '1', 'submenu-back', true);
    manager.onResult(result({ operation: 'close', returnFocus: 'not-mounted' }));
    await expect(request).resolves.toEqual({ status: 'confirmed', returnFocus: 'not-mounted' });
    manager.onDismiss('presentation-1');
    expect(manager.isCurrentGeneration('presentation-1')).toBe(false);
  });

  it('cancels superseded focus requests without cancelling a pending close', async () => {
    const { manager, target, result } = setup(true);
    const initial = manager.focusInitialChild('presentation-1', target);
    const close = manager.closeOwned('presentation-1', 'action', true);
    const firstOwned = manager.focusOwnedChild('presentation-1', target, 'keyboard');
    await expect(initial).resolves.toEqual({ status: 'cancelled' });
    const secondOwned = manager.focusOwnedChild('presentation-1', target, 'pointer');
    await expect(firstOwned).resolves.toEqual({ status: 'cancelled' });
    manager.onResult(result({ operation: 'owned-child-focus', requestId: '3' }));
    manager.onResult(result({ operation: 'owned-child-focus', requestId: '4' }));
    await expect(secondOwned).resolves.toEqual({ status: 'confirmed' });
    manager.onResult(result({ operation: 'close', requestId: '2', returnFocus: 'confirmed' }));
    await expect(close).resolves.toEqual({ status: 'confirmed', returnFocus: 'confirmed' });
  });

  it('cancels owned focus on ref replacement and genuine native family dismissal', async () => {
    const { manager, target, result } = setup(true);
    const first = manager.focusOwnedChild('presentation-1', target, 'repair');
    target.current = new React.Component({});
    manager.onResult(result({ operation: 'owned-child-focus' }));
    await expect(first).resolves.toEqual({ status: 'cancelled' });
    const second = manager.focusOwnedChild('presentation-1', target, 'repair');
    manager.onDismiss('presentation-1');
    await expect(second).resolves.toEqual({ status: 'cancelled' });
    manager.onReady('presentation-2');
    manager.onResult(result({ operation: 'owned-child-focus', requestId: '2' }));
    expect(manager.isCurrentGeneration('presentation-1')).toBe(false);
    expect(manager.isCurrentGeneration('presentation-2')).toBe(true);
  });

  it('does not conflate initial focus and owned-child result identities', async () => {
    const { manager, target, result } = setup(true);
    const request = manager.focusOwnedChild('presentation-1', target, 'repair');
    expect(() => manager.onResult(result())).toThrow('invalid managed operation result');
    await expect(request).resolves.toEqual({ status: 'failed' });
  });

  it('preserves refused focus, missing dispatch targets and command failures for the new command', async () => {
    const { manager, dispatchOwnedFocus, target, result } = setup(true);
    const request = manager.focusOwnedChild('presentation-1', target, 'repair');
    manager.onResult(result({ operation: 'owned-child-focus', status: 'inactive-window' }));
    await expect(request).resolves.toEqual({ status: 'inactive-window' });
    dispatchOwnedFocus.mockReturnValue(false);
    await expect(manager.focusOwnedChild('presentation-1', target, 'pointer')).resolves.toEqual({ status: 'not-mounted' });
    dispatchOwnedFocus.mockImplementation(() => {
      throw new Error('owned native dispatch failed');
    });
    await expect(manager.focusOwnedChild('presentation-1', target, 'keyboard')).rejects.toThrow('owned native dispatch failed');
  });

  it.each(['not-mounted', 'not-focusable', 'focus-moved', 'failed'] as const)('preserves native owned-child %s refusal', async (status) => {
    const { manager, target, result } = setup(true);
    const request = manager.focusOwnedChild('presentation-1', target, 'repair');
    manager.onResult(result({ operation: 'owned-child-focus', status }));
    await expect(request).resolves.toEqual({ status });
  });

  it('resolves the originating leaf result before cancelling each independently ready family member', async () => {
    const root = setup(true);
    const child = setup(true);
    const leaf = setup(true);
    root.manager.onReady('root');
    child.manager.onReady('child');
    leaf.manager.onReady('leaf');
    const rootFocus = root.manager.focusOwnedChild('root', root.target, 'repair');
    const childFocus = child.manager.focusOwnedChild('child', child.target, 'keyboard');
    const action = leaf.manager.closeOwned('leaf', 'action', true);
    leaf.manager.onResult(leaf.result({ generation: 'leaf', operation: 'close', returnFocus: 'confirmed' }));
    leaf.manager.onDismiss('leaf');
    child.manager.onDismiss('child');
    root.manager.onDismiss('root');
    await expect(action).resolves.toEqual({ status: 'confirmed', returnFocus: 'confirmed' });
    await expect(rootFocus).resolves.toEqual({ status: 'cancelled' });
    await expect(childFocus).resolves.toEqual({ status: 'cancelled' });
    expect(root.dispatchClose).not.toHaveBeenCalled();
    expect(child.dispatchClose).not.toHaveBeenCalled();
    expect(leaf.dispatchClose).toHaveBeenCalledTimes(1);
  });

  it('cancels owned work on detach/disable and rejects old sessions before dispatch', async () => {
    const { manager, dispatchOwnedFocus, target } = setup(true);
    await expect(manager.focusOwnedChild('stale', target, 'repair')).resolves.toEqual({ status: 'cancelled' });
    await expect(manager.focusOwnedChild('presentation-1', { current: null }, 'repair')).resolves.toEqual({ status: 'not-mounted' });
    expect(dispatchOwnedFocus).not.toHaveBeenCalled();
    const detached = manager.focusOwnedChild('presentation-1', target, 'repair');
    manager.detach();
    await expect(detached).resolves.toEqual({ status: 'cancelled' });
    manager.onReady('presentation-2');
    const disabled = manager.focusOwnedChild('presentation-2', target, 'pointer');
    manager.setEnabled(false);
    await expect(disabled).resolves.toEqual({ status: 'cancelled' });
    await expect(manager.focusOwnedChild('presentation-2', target, 'keyboard')).resolves.toEqual({ status: 'unsupported' });
    expect(dispatchOwnedFocus).toHaveBeenCalledTimes(2);
  });

  it('recognizes truthful native Tab and submenu contexts and validates movement payloads', () => {
    for (const reason of ['tab', 'submenu-back']) {
      expect(isDismissContextEvent(nativeEvent({ generation: 'one', reason, returnFocus: 'not-requested' }))).toBe(true);
    }
    const payload = { generation: 'one', pointerId: 'mouse', screenX: -120, screenY: 90, targetTag: 42 };
    expect(isMenuPointerMoveEvent(nativeEvent(payload))).toBe(true);
    expect(isMenuPointerMoveEvent(nativeEvent({ ...payload, targetTag: 0 }))).toBe(true);
    expect(isMenuPointerMoveEvent(nativeEvent({ ...payload, targetTag: 2147483647 }))).toBe(true);
    expect(isMenuPointerMoveEvent(nativeEvent({ ...payload, screenX: NaN }))).toBe(false);
    expect(isMenuPointerMoveEvent(nativeEvent({ ...payload, screenY: Infinity }))).toBe(false);
    expect(isMenuPointerMoveEvent(nativeEvent({ ...payload, pointerId: '' }))).toBe(false);
  });

  it.each([-1, 1.5, NaN, Infinity, -Infinity, 2147483648, Number.MAX_SAFE_INTEGER])(
    'rejects movement targetTag outside the nonnegative Int32 contract: %s',
    (targetTag) => {
      const payload = { generation: 'one', pointerId: 'mouse', screenX: -120, screenY: 90, targetTag };
      expect(isMenuPointerMoveEvent(nativeEvent(payload))).toBe(false);
    },
  );

  it('rejects old movement payloads with no current-event hit target', () => {
    const event = nativeEvent({ generation: 'one', pointerId: 'mouse', screenX: -120, screenY: 90 });
    // @ts-expect-error The shared event contract now requires the current-event hit target.
    expect(isMenuPointerMoveEvent(event)).toBe(false);
  });
});

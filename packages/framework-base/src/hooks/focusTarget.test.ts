import { createFocusTarget, isSelfTargetEvent } from './focusTarget';

describe('focus target controller', () => {
  it('distinguishes requests from observed native focus', () => {
    const target = createFocusTarget();
    const focus = jest.fn();
    target.attach({ focus });
    const request = target.requestFocus('keyboard');
    expect(focus).toHaveBeenCalledTimes(1);
    expect(request.status).toBe('requested');
    expect(target.getSnapshot().focused).toBe(false);

    target.onFocus();
    expect(request.status).toBe('confirmed');
    expect(target.getSnapshot()).toEqual({ focused: true, intent: 'keyboard' });
    expect(target.requestFocus().status).toBe('confirmed');
    expect(focus).toHaveBeenCalledTimes(1);
    target.onBlur();
    expect(target.getSnapshot().focused).toBe(false);
  });

  it('reports unavailable targets explicitly', () => {
    const target = createFocusTarget();
    expect(target.requestFocus().status).toBe('not-mounted');
    target.attach({});
    expect(target.requestFocus().status).toBe('unsupported');
    target.setFocusable(false);
    expect(target.requestFocus().status).toBe('not-focusable');
  });

  it('cancels superseded, detached, disabled, and explicitly cancelled requests', () => {
    const target = createFocusTarget();
    const detach = target.attach({ focus: jest.fn() });
    const first = target.requestFocus('keyboard');
    const second = target.requestFocus('pointer');
    expect(first.status).toBe('cancelled');
    second.cancel();
    expect(second.status).toBe('cancelled');
    const third = target.requestFocus();
    target.setFocusable(false);
    expect(third.status).toBe('cancelled');
    target.setFocusable(true);
    const fourth = target.requestFocus();
    detach();
    expect(fourth.status).toBe('cancelled');
    target.onFocus();
    expect(target.getSnapshot().focused).toBe(false);
  });

  it('ignores stale cleanup and preserves the newer registration', () => {
    const target = createFocusTarget();
    const oldDetach = target.attach({ focus: jest.fn() });
    const newer = { focus: jest.fn() };
    const detach = target.attach(newer);
    const generation = target.generation;
    oldDetach();
    expect(target.current).toBe(newer);
    expect(target.generation).toBe(generation);
    target.requestFocus();
    expect(newer.focus).toHaveBeenCalledTimes(1);
    detach();
    detach();
    expect(target.current).toBeNull();
  });

  it('clears observed focus on disable and does not resurrect it on enable', () => {
    const target = createFocusTarget();
    target.attach({ focus: jest.fn() });
    target.onFocus();
    target.setFocusable(false);
    target.setFocusable(true);
    expect(target.getSnapshot().focused).toBe(false);
  });

  it('preserves native focus during a same-commit callback-ref handoff', async () => {
    const target = createFocusTarget();
    const instance = { focus: jest.fn() };
    const detach = target.attach(instance);
    target.onFocus();
    detach();
    const finalDetach = target.attach(instance);
    expect(target.getSnapshot().focused).toBe(true);
    finalDetach();
    await Promise.resolve();
    target.attach(instance);
    expect(target.getSnapshot().focused).toBe(false);
  });

  it('keeps snapshots stable and cleans subscriptions', () => {
    const target = createFocusTarget();
    target.attach({ focus: jest.fn() });
    const notify = jest.fn();
    const unsubscribe = target.subscribe(notify);
    const before = target.getSnapshot();
    target.onBlur();
    expect(target.getSnapshot()).toBe(before);
    target.onFocus();
    expect(notify).toHaveBeenCalledTimes(1);
    unsubscribe();
    unsubscribe();
    target.onBlur();
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('surfaces a native focus error without leaving a live request', () => {
    const target = createFocusTarget();
    target.attach({
      focus: () => {
        throw new Error('native failure');
      },
    });
    expect(() => target.requestFocus()).toThrow('native failure');
    target.onFocus();
    expect(target.getSnapshot().intent).toBeUndefined();
  });

  it('distinguishes self-focus from a bubbled descendant event', () => {
    expect(isSelfTargetEvent({ target: 1, currentTarget: 1 })).toBe(true);
    expect(isSelfTargetEvent({ target: 2, currentTarget: 1 })).toBe(false);
    expect(isSelfTargetEvent({ nativeEvent: { target: 2 }, currentTarget: 1 })).toBe(false);
    expect(isSelfTargetEvent({})).toBe(true);
  });
});

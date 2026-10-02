import type {
  CalloutHandle,
  CalloutReadyEvent,
  CalloutDismissContextEvent,
  CalloutMenuPointerMoveEvent,
} from '@fluentui-react-native/callout';
import { createPopoverMenuSession } from './popoverMenuSession';
import type { PopoverMenuHostOptions } from './popover.types';
import { nativeEvent } from './popover.native-events.test-helpers';

const ready = (generation = 'native-1'): CalloutReadyEvent => nativeEvent({ generation });
const context = (
  reason: CalloutDismissContextEvent['nativeEvent']['reason'] = 'escape',
  generation = 'native-1',
): CalloutDismissContextEvent => nativeEvent({ generation, reason, returnFocus: 'not-requested' });

function scene() {
  let current = true;
  const invalidate = jest.fn();
  const close = jest.fn();
  const retire = jest.fn();
  const options: { -readonly [K in keyof PopoverMenuHostOptions]: PopoverMenuHostOptions[K] } = {
    policy: 'menu-macos',
    initialFocus: 'owner',
    presentationKey: 'attempt-1',
    onReady: jest.fn(),
    onDismissContext: jest.fn(),
    onPointerMove: jest.fn(),
    onShow: jest.fn(),
    onDismiss: jest.fn(),
  };
  const handle: CalloutHandle = {
    focusWindow: jest.fn(),
    blurWindow: jest.fn(),
    focusInitialChild: jest.fn(),
    focusOwnedChild: jest.fn(),
    closeOwned: jest.fn(),
  };
  const session = createPopoverMenuSession(
    42,
    () => current,
    () => options,
    invalidate,
    close,
    retire,
  );
  return {
    session,
    options,
    handle,
    invalidate,
    close,
    retire,
    detach: () => {
      current = false;
    },
  };
}

describe('Popover managed presentation session', () => {
  it('exposes actual mounted then ready methods without legacy window commands or automatic focus', () => {
    const { session, handle, options } = scene();
    session.mount();
    session.attachHandle(handle);
    const mounted = session.binding.getCurrent();
    expect(mounted?.phase).toBe('mounted');
    expect(mounted?.anchorMountGeneration).toBe(42);
    expect(mounted?.handle).toEqual({
      focusInitialChild: handle.focusInitialChild,
      focusOwnedChild: handle.focusOwnedChild,
      closeOwned: handle.closeOwned,
    });
    const event = ready();
    session.onReady(event);
    expect(session.binding.getCurrent()).toMatchObject({ phase: 'ready', nativeGeneration: 'native-1' });
    expect(options.onReady).toHaveBeenCalledWith(event, session.binding);
    expect(handle.focusInitialChild).not.toHaveBeenCalled();
    expect(handle.focusOwnedChild).not.toHaveBeenCalled();
  });

  it('retains original ready-before-ref until actual attachment and cancels it on unmount', () => {
    const { session, handle, options } = scene();
    const event = ready();
    session.onReady(event);
    expect(options.onReady).not.toHaveBeenCalled();
    session.attachHandle(handle);
    session.mount();
    expect(options.onReady).toHaveBeenCalledWith(event, session.binding);
    session.onReady(event);
    expect(options.onReady).toHaveBeenCalledTimes(1);
    session.unmount();
    session.onReady(ready('late'));
    session.attachHandle(handle);
    expect(session.binding.getCurrent()).toBeUndefined();
    expect(options.onReady).toHaveBeenCalledTimes(1);
  });

  it('aborts old native-generation leases before publishing a replacement ready event', () => {
    const { session, handle, options } = scene();
    session.mount();
    session.attachHandle(handle);
    session.onReady(ready());
    const previous = session.binding.getCurrent();
    session.onReady(ready('native-2'));
    expect(previous?.signal.aborted).toBe(true);
    expect(session.binding.getCurrent()?.signal.aborted).toBe(false);
    expect(options.onReady).toHaveBeenCalledTimes(2);
    session.onReady(ready('native-1'));
    expect(session.binding.getCurrent()).toMatchObject({ nativeGeneration: 'native-2' });
    expect(options.onReady).toHaveBeenCalledTimes(2);
  });

  it('revokes before context observer but retains genuine legacy delivery with exactly one close', () => {
    const { session, handle, options, close, retire } = scene();
    session.mount();
    session.attachHandle(handle);
    session.onReady(ready());
    const snapshot = session.binding.getCurrent();
    options.onDismissContext = jest.fn((event, binding) => {
      expect(event).toBe(original);
      expect(snapshot?.signal.aborted).toBe(true);
      expect(binding.getCurrent()).toBeUndefined();
      expect(close).not.toHaveBeenCalled();
    });
    const original = context();
    session.onDismissContext(original);
    expect(retire).not.toHaveBeenCalled();
    session.onDismissContext(original);
    session.onDismiss();
    session.onDismiss();
    expect(options.onDismissContext).toHaveBeenCalledTimes(1);
    expect(options.onDismiss).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(retire).toHaveBeenCalledTimes(1);
  });

  it('closes teardown-only context without fabricating legacy dismissal', () => {
    const { session, handle, options, close, retire } = scene();
    session.mount();
    session.attachHandle(handle);
    session.onReady(ready());
    session.onDismissContext(context('host-detached'));
    session.onDismiss();
    expect(close).toHaveBeenCalledTimes(1);
    expect(retire).toHaveBeenCalledTimes(1);
    expect(options.onDismiss).not.toHaveBeenCalled();
  });

  it('accepts a terminal context before native readiness without inventing focus or ready', () => {
    const { session, options, close } = scene();
    session.mount();
    session.onDismissContext(context('host-detached'));
    expect(close).toHaveBeenCalledTimes(1);
    expect(options.onReady).not.toHaveBeenCalled();
  });

  it('rejects stale generations, pointer after hide, and callbacks after live synchronous detach', () => {
    const { session, handle, options, close, detach } = scene();
    session.mount();
    session.attachHandle(handle);
    session.onReady(ready());
    const pointer: CalloutMenuPointerMoveEvent = nativeEvent({
      generation: 'native-1',
      pointerId: 'mouse',
      screenX: 1,
      screenY: 2,
      targetTag: 0,
    });
    session.onDismissContext(context('escape', 'old'));
    session.onPointerMove({ ...pointer, nativeEvent: { ...pointer.nativeEvent, generation: 'old' } });
    expect(close).not.toHaveBeenCalled();
    expect(options.onPointerMove).not.toHaveBeenCalled();
    session.onPointerMove(pointer);
    expect(options.onPointerMove).toHaveBeenCalledWith(pointer, session.binding);
    const snapshot = session.binding.getCurrent();
    detach();
    expect(session.binding.getCurrent()).toBeUndefined();
    expect(snapshot?.signal.aborted).toBe(true);
    session.onPointerMove(pointer);
    session.onDismissContext(context());
    session.onDismiss();
    expect(options.onPointerMove).toHaveBeenCalledTimes(1);
    expect(options.onDismissContext).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('keeps show and legacy-only dismissal truthful and once-only', () => {
    const { session, handle, options, close } = scene();
    session.mount();
    session.attachHandle(handle);
    session.onShow();
    session.onShow();
    session.onDismiss();
    expect(options.onShow).toHaveBeenCalledTimes(1);
    expect(options.onDismiss).toHaveBeenCalledTimes(1);
    expect(options.onDismissContext).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
    session.onReady(ready());
    expect(options.onReady).not.toHaveBeenCalled();
  });

  it('does not swallow caller errors and still retires terminal transport', () => {
    const { session, options, retire } = scene();
    options.onDismiss = () => {
      throw new Error('caller');
    };
    session.mount();
    expect(() => session.onDismiss()).toThrow('caller');
    expect(retire).toHaveBeenCalledTimes(1);
  });

  it('invalidates a pending native Promise continuation without claiming native request cancellation', async () => {
    const { session, handle, options, close } = scene();
    let settle: ((result: { status: 'confirmed' }) => void) | undefined;
    handle.focusInitialChild = () =>
      new Promise((resolve) => {
        settle = resolve;
      });
    session.mount();
    session.attachHandle(handle);
    session.onReady(ready());
    const snapshot = session.binding.getCurrent();
    if (!snapshot || snapshot.phase !== 'ready' || !snapshot.handle.focusInitialChild) {
      throw new Error('Expected a ready mounted native host.');
    }
    const nativeRef = { current: null };
    const request = snapshot.handle.focusInitialChild(snapshot.nativeGeneration, nativeRef);
    session.onDismissContext(context());
    expect(snapshot.signal.aborted).toBe(true);
    settle?.({ status: 'confirmed' });
    expect(await request).toEqual({ status: 'confirmed' });
    expect(session.binding.getCurrent()).toBeUndefined();
    expect(close).not.toHaveBeenCalled();
    expect(options.onDismiss).not.toHaveBeenCalled();
    session.onDismiss();
    expect(close).toHaveBeenCalledTimes(1);
  });
});

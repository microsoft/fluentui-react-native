import type { CalloutHandle, CalloutReadyEvent, CalloutDismissContextEvent, CalloutProps } from '@fluentui-react-native/callout';
import type { PopoverMenuHostBinding, PopoverMenuHostOptions, PopoverMenuHostSnapshot } from './popover.types';

/** Presentation authorization only; native command correlation and results remain in Callout. */
export function createPopoverMenuSession(
  anchorMountGeneration: number,
  isCurrent: () => boolean,
  options: () => PopoverMenuHostOptions,
  invalidate: () => void,
  close: () => void,
  retire: () => void,
) {
  let active = false;
  let disposed = false;
  let hidden = false;
  let terminal = false;
  let handle: CalloutHandle | null = null;
  let lease = new AbortController();
  let snapshot: PopoverMenuHostSnapshot | undefined;
  let pendingReady: CalloutReadyEvent | undefined;
  let nativeGeneration: string | undefined;
  const retiredGenerations = new Set<string>();
  let shown = false;
  let contextDelivered = false;
  let legacyDelivered = false;
  let closeRequested = false;
  const revoke = () => {
    lease.abort();
    snapshot = undefined;
    pendingReady = undefined;
  };
  const current = () => {
    const attached = isCurrent();
    if (!attached) revoke();
    return active && !hidden && !terminal && attached;
  };
  const binding: PopoverMenuHostBinding = {
    getCurrent() {
      if (!current() || !handle) {
        if (!isCurrent()) revoke();
        return undefined;
      }
      if (!snapshot) {
        if (lease.signal.aborted) lease = new AbortController();
        publish();
      }
      return snapshot;
    },
  };
  const requestClose = () => {
    if (!closeRequested) {
      closeRequested = true;
      close();
    }
  };
  const publish = () => {
    if (!current() || !handle) return;
    const methods = {
      focusInitialChild: handle.focusInitialChild,
      focusOwnedChild: handle.focusOwnedChild,
      closeOwned: handle.closeOwned,
    };
    snapshot = nativeGeneration
      ? { handle: methods, anchorMountGeneration, signal: lease.signal, phase: 'ready', nativeGeneration }
      : { handle: methods, anchorMountGeneration, signal: lease.signal, phase: 'mounted' };
    if (pendingReady) {
      const event = pendingReady;
      pendingReady = undefined;
      options().onReady?.(event, binding);
    }
  };
  return {
    binding,
    get hidden() {
      return hidden;
    },
    get terminal() {
      return terminal;
    },
    mount() {
      disposed = false;
      active = true;
      if (lease.signal.aborted && !hidden && !terminal) lease = new AbortController();
      publish();
    },
    unmount() {
      disposed = true;
      active = false;
      handle = null;
      revoke();
    },
    attachHandle(next: CalloutHandle | null) {
      if (handle && handle !== next) revoke();
      handle = next;
      if (next && lease.signal.aborted && !hidden && !terminal) lease = new AbortController();
      publish();
    },
    cancelAnchor() {
      if (terminal) return;
      hidden = true;
      terminal = true;
      revoke();
      invalidate();
      requestClose();
      retire();
    },
    onReady(event: CalloutReadyEvent) {
      if (!isCurrent()) revoke();
      if (disposed || hidden || terminal || !isCurrent()) return;
      const generation = event.nativeEvent.generation;
      if (!generation) throw new Error('Popover: managed readiness requires a native generation.');
      if (generation === nativeGeneration || retiredGenerations.has(generation)) return;
      if (nativeGeneration) {
        retiredGenerations.add(nativeGeneration);
        revoke();
        lease = new AbortController();
      }
      nativeGeneration = generation;
      event.persist?.();
      pendingReady = event;
      publish();
    },
    onShow() {
      if (current() && !shown) {
        shown = true;
        options().onShow?.();
      }
    },
    onPointerMove(event: Parameters<NonNullable<CalloutProps['onMenuPointerMove']>>[0]) {
      if (current() && handle && nativeGeneration === event.nativeEvent.generation) {
        options().onPointerMove?.(event, binding);
      }
    },
    onDismissContext(event: CalloutDismissContextEvent) {
      if (!isCurrent()) revoke();
      if (!active || terminal || !isCurrent() || contextDelivered) return;
      if (nativeGeneration && event.nativeEvent.generation !== nativeGeneration) return;
      hidden = true;
      contextDelivered = true;
      revoke();
      invalidate();
      // Keep transport attached until Callout sends the genuine legacy terminal notification.
      try {
        options().onDismissContext?.(event, binding);
      } finally {
        if (event.nativeEvent.reason === 'host-detached') {
          terminal = true;
          requestClose();
          retire();
        }
      }
    },
    onDismiss() {
      if (!active || terminal || !isCurrent() || legacyDelivered) return;
      hidden = true;
      terminal = true;
      legacyDelivered = true;
      revoke();
      invalidate();
      try {
        requestClose();
        options().onDismiss?.();
      } finally {
        retire();
      }
    },
  };
}

export type PopoverMenuSession = ReturnType<typeof createPopoverMenuSession>;

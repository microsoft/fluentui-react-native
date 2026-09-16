export type FocusIntent = 'keyboard' | 'pointer' | 'programmatic' | 'restore' | 'accessibility';
export type FocusRequestStatus = 'requested' | 'confirmed' | 'cancelled' | 'not-mounted' | 'not-focusable' | 'unsupported';

export interface FocusRequest {
  readonly status: FocusRequestStatus;
  cancel(): void;
}

export interface FocusTargetSnapshot {
  readonly focused: boolean;
  readonly intent?: FocusIntent;
}

export interface FocusTarget {
  readonly current: object | null;
  readonly generation: number;
  getSnapshot(): FocusTargetSnapshot;
  subscribe(listener: () => void): () => void;
  requestFocus(intent?: FocusIntent): FocusRequest;
}

export interface FocusTargetController extends FocusTarget {
  attach(instance: object): () => void;
  setFocusable(focusable: boolean): void;
  onFocus(): void;
  onBlur(): void;
}

/**
 * A focus request is only confirmed by an observed focus event, not by a void
 * native focus() return. Registration epochs reject stale ref cleanup.
 */
export function createFocusTarget(): FocusTargetController {
  let current: object | null = null;
  let generation = 0;
  let registration = 0;
  let focusable = true;
  let snapshot: FocusTargetSnapshot = Object.freeze({ focused: false });
  let detached: { instance: object } | undefined;
  let pending: { status: FocusRequestStatus; intent: FocusIntent } | undefined;
  const listeners = new Set<() => void>();
  const publish = (focused: boolean, intent?: FocusIntent, attachmentChanged = false) => {
    if (attachmentChanged || snapshot.focused !== focused || snapshot.intent !== intent) {
      snapshot = Object.freeze({ focused, intent });
      Array.from(listeners).forEach((listener) => listener());
    }
  };
  const cancelPending = () => {
    if (pending) {
      pending.status = 'cancelled';
      pending = undefined;
    }
  };

  return {
    get current() {
      return current;
    },
    get generation() {
      return generation;
    },
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    attach: (instance) => {
      cancelPending();
      const sameTarget = current === instance || detached?.instance === instance;
      const attachmentChanged = !sameTarget && generation !== 0;
      const focused = sameTarget && snapshot.focused;
      const intent = sameTarget ? snapshot.intent : undefined;
      detached = undefined;
      current = instance;
      const attachment = ++registration;
      if (!sameTarget) {
        ++generation;
      }
      publish(focusable && focused, intent, attachmentChanged);
      return () => {
        if (registration === attachment) {
          ++registration;
          const handoff = { instance };
          detached = handoff;
          // A callback-ref replacement reattaches the same native instance in
          // this commit. Coalesce that handoff without invalidating subscribers
          // or its mount generation, but notify genuine detach/replacement.
          queueMicrotask(() => {
            if (detached === handoff) {
              detached = undefined;
              ++generation;
              publish(false, undefined, true);
            }
          });
          current = null;
          cancelPending();
        }
      };
    },
    setFocusable: (next) => {
      focusable = next;
      if (!next) {
        cancelPending();
        publish(false);
      }
    },
    onFocus: () => {
      if (current && focusable) {
        const intent = pending?.intent;
        if (pending) {
          pending.status = 'confirmed';
          pending = undefined;
        }
        publish(true, intent);
      }
    },
    onBlur: () => {
      cancelPending();
      publish(false);
    },
    requestFocus: (intent = 'programmatic') => {
      cancelPending();
      const request: { status: FocusRequestStatus; intent: FocusIntent } = {
        status: !current
          ? 'not-mounted'
          : !focusable
            ? 'not-focusable'
            : !('focus' in current) || typeof current.focus !== 'function'
              ? 'unsupported'
              : snapshot.focused
                ? 'confirmed'
                : 'requested',
        intent,
      };
      const result: FocusRequest = {
        get status() {
          return request.status;
        },
        cancel: () => {
          if (pending === request) {
            cancelPending();
          }
        },
      };
      if (request.status === 'requested' && current && 'focus' in current && typeof current.focus === 'function') {
        pending = request;
        try {
          current.focus();
        } catch (error) {
          cancelPending();
          throw error;
        }
      }
      return result;
    },
  };
}

export interface FocusTargetEvent {
  readonly target?: unknown;
  readonly currentTarget?: unknown;
  readonly nativeEvent?: { readonly target?: unknown };
}

export function isSelfTargetEvent(event: FocusTargetEvent): boolean {
  const target = event.target ?? event.nativeEvent?.target;
  return event.currentTarget == null || target == null || target === event.currentTarget;
}

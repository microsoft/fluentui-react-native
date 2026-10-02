import type * as React from 'react';

import type { NativeSyntheticEvent } from 'react-native';

import type {
  CalloutCloseOutcome,
  CalloutCloseReason,
  CalloutDismissContextEvent,
  CalloutDismissReason,
  CalloutFocusOutcome,
  CalloutFocusIntent,
  CalloutMenuPointerMoveEvent,
  CalloutOperationStatus,
  CalloutReturnFocusStatus,
} from './Callout.types';

export interface ManagedOperationResult {
  generation: string;
  requestId: string;
  operation: string;
  status: string;
  returnFocus: string;
}

interface PendingRequest {
  generation: string;
  operation: 'initial-focus' | 'owned-child-focus' | 'close';
  resolve: (result: CalloutCloseOutcome) => void;
  isCurrent?: () => boolean;
}

export function isOperationStatus(status: string): status is CalloutOperationStatus {
  return ['confirmed', 'cancelled', 'not-mounted', 'not-focusable', 'inactive-window', 'focus-moved', 'unsupported', 'failed'].includes(
    status,
  );
}

export function isReturnFocusStatus(status: string): status is CalloutReturnFocusStatus {
  return status === 'not-requested' || (status !== 'unsupported' && isOperationStatus(status));
}

export function isDismissReason(reason: string): reason is CalloutDismissReason {
  return ['escape', 'action', 'submenu-back', 'tab', 'native-light-dismiss', 'programmatic', 'host-detached'].includes(reason);
}

export function isMenuPointerMoveEvent(
  event: NativeSyntheticEvent<{ generation: string; pointerId: string; screenX: number; screenY: number; targetTag: number }>,
): event is CalloutMenuPointerMoveEvent {
  const { generation, pointerId, screenX, screenY, targetTag } = event.nativeEvent;
  return (
    typeof generation === 'string' &&
    generation.length > 0 &&
    typeof pointerId === 'string' &&
    pointerId.length > 0 &&
    Number.isFinite(screenX) &&
    Number.isFinite(screenY) &&
    Number.isInteger(targetTag) &&
    targetTag >= 0 &&
    targetTag <= 2147483647
  );
}

export function isDismissContextEvent(
  event: NativeSyntheticEvent<{ generation: string; reason: string; returnFocus: string }>,
): event is CalloutDismissContextEvent {
  return isDismissReason(event.nativeEvent.reason) && isReturnFocusStatus(event.nativeEvent.returnFocus);
}

export function createMenuFocusManagement(
  dispatchFocus: (generation: string, requestId: string, target: React.Component) => boolean,
  dispatchClose: (generation: string, requestId: string, reason: CalloutCloseReason, returnFocus: boolean) => boolean,
  dispatchOwnedFocus?: (generation: string, requestId: string, target: React.Component, intent: CalloutFocusIntent) => boolean,
) {
  let enabled = false;
  let generation: string | undefined;
  let nextRequest = 0;
  const pending = new Map<string, PendingRequest>();
  const finish = (requestId: string, result: CalloutCloseOutcome) => {
    const request = pending.get(requestId);
    if (request) {
      pending.delete(requestId);
      request.resolve(request.isCurrent && !request.isCurrent() ? { status: 'cancelled', returnFocus: 'cancelled' } : result);
    }
  };
  const invalidate = () => {
    generation = undefined;
    for (const requestId of pending.keys()) {
      finish(requestId, { status: 'cancelled', returnFocus: 'cancelled' });
    }
  };
  const unavailable = (expected: string): CalloutCloseOutcome | undefined =>
    !enabled
      ? { status: 'unsupported', returnFocus: 'not-requested' }
      : !generation
        ? { status: 'not-mounted', returnFocus: 'not-requested' }
        : expected !== generation
          ? { status: 'cancelled', returnFocus: 'cancelled' }
          : undefined;

  const requestFocus = (
    expected: string,
    target: React.RefObject<React.Component | null>,
    operation: 'initial-focus' | 'owned-child-focus',
    dispatch: (requestId: string, instance: React.Component) => boolean,
  ): Promise<CalloutFocusOutcome> => {
    const blocked = unavailable(expected);
    if (blocked) return Promise.resolve({ status: blocked.status });
    const instance = target.current;
    if (!instance) return Promise.resolve({ status: 'not-mounted' });
    if (operation === 'owned-child-focus') {
      for (const [requestId, request] of pending) {
        if (request.operation !== 'close') finish(requestId, { status: 'cancelled', returnFocus: 'not-requested' });
      }
    }
    return new Promise<CalloutCloseOutcome>((resolve, reject) => {
      const requestId = String(++nextRequest);
      pending.set(requestId, {
        generation: expected,
        operation,
        resolve,
        isCurrent: () => target.current === instance,
      });
      try {
        if (!dispatch(requestId, instance)) finish(requestId, { status: 'not-mounted', returnFocus: 'not-requested' });
      } catch (error) {
        pending.delete(requestId);
        reject(error);
      }
    }).then(({ status }) => ({ status }));
  };

  return {
    setEnabled(value: boolean) {
      if (enabled !== value) {
        invalidate();
        enabled = value;
      }
    },
    detach: invalidate,
    onReady(value: string) {
      if (!enabled) return;
      if (!value) throw new Error('Callout received an empty managed presentation generation.');
      if (value !== generation) {
        invalidate();
        generation = value;
      }
    },
    onDismiss(value: string) {
      if (generation === value) invalidate();
    },
    isCurrentGeneration(value: string) {
      return enabled && generation !== undefined && value === generation;
    },
    onResult(event: ManagedOperationResult) {
      const request = pending.get(event.requestId);
      if (!request || event.generation !== request.generation || event.generation !== generation) return;
      if (event.operation !== request.operation || !isOperationStatus(event.status) || !isReturnFocusStatus(event.returnFocus)) {
        finish(event.requestId, { status: 'failed', returnFocus: 'failed' });
        throw new Error('Callout received an invalid managed operation result.');
      }
      finish(event.requestId, { status: event.status, returnFocus: event.returnFocus });
    },
    focusInitialChild(expected: string, target: React.RefObject<React.Component | null>): Promise<CalloutFocusOutcome> {
      return requestFocus(expected, target, 'initial-focus', (requestId, instance) => dispatchFocus(expected, requestId, instance));
    },
    focusOwnedChild(
      expected: string,
      target: React.RefObject<React.Component | null>,
      intent: CalloutFocusIntent,
    ): Promise<CalloutFocusOutcome> {
      if (!dispatchOwnedFocus) return Promise.resolve({ status: 'unsupported' });
      if (!['keyboard', 'pointer', 'repair'].includes(intent)) throw new Error('Callout received an invalid owned-child focus intent.');
      return requestFocus(expected, target, 'owned-child-focus', (requestId, instance) =>
        dispatchOwnedFocus(expected, requestId, instance, intent),
      );
    },
    closeOwned(expected: string, reason: CalloutCloseReason, returnFocus: boolean): Promise<CalloutCloseOutcome> {
      if (reason === 'submenu-back' && !dispatchOwnedFocus) {
        return Promise.resolve({ status: 'unsupported', returnFocus: 'not-requested' });
      }
      if (!['action', 'programmatic', 'submenu-back'].includes(reason)) throw new Error('Callout received an invalid owned close reason.');
      const blocked = unavailable(expected);
      if (blocked) return Promise.resolve(blocked);
      return new Promise((resolve, reject) => {
        const requestId = String(++nextRequest);
        pending.set(requestId, { generation: expected, operation: 'close', resolve });
        try {
          if (!dispatchClose(expected, requestId, reason, returnFocus)) {
            finish(requestId, { status: 'not-mounted', returnFocus: 'not-requested' });
          }
        } catch (error) {
          pending.delete(requestId);
          reject(error);
        }
      });
    },
  };
}

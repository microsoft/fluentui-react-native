import { executeOperation } from '../operations/executor.js';
import { maxOperationRequestBytes } from '../operations/limits.js';
import { describeOperations } from '../operations/registry.js';
import type { ContentPolicy, OperationHost, OperationRuntime } from '../operations/runtime.js';
import { safeToken } from '../operations/text.js';
import { HostUnsupportedError, WebDriverError } from '../protocol/errors.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { DesktopSession, SessionManager } from './SessionManager.js';

export type SessionOperationOptions = {
  contentPolicy: ContentPolicy;
  /** Aborts when the caller leaves, which ends the request's host commands. */
  signal: AbortSignal;
};

/** True for `/session/<id>/furn/ops...`, whose bodies are small by contract. */
export function isOperationPath(segments: readonly string[]): boolean {
  return segments[0] === 'session' && segments[2] === 'furn' && segments[3] === 'ops';
}

/** The largest request body a path may carry: operations take a few hundred bytes, so they get a tighter cap. */
export function requestBodyLimit(segments: readonly string[], maxBodyBytes: number): number {
  return isOperationPath(segments) ? Math.min(maxBodyBytes, maxOperationRequestBytes) : maxBodyBytes;
}

/**
 * Binds one session to the operation layer for one request. The runtime reads the session when asked rather than when
 * built, so a command queued behind another sees the window and timeouts the earlier command left behind.
 */
export function createOperationRuntime(
  session: DesktopSession,
  sessions: SessionManager,
  options: SessionOperationOptions,
): OperationRuntime {
  const nativeHost = session.target.host;
  const observe = nativeHost.observe?.bind(nativeHost);
  const releaseElements = nativeHost.releaseElements?.bind(nativeHost);
  const subscribe = nativeHost.subscribe?.bind(nativeHost);
  const listAccessibilityActions = nativeHost.listAccessibilityActions?.bind(nativeHost);
  const performAccessibilityAction = nativeHost.performAccessibilityAction?.bind(nativeHost);
  const features = session.hostInfo.features;
  const host: OperationHost = {
    activate: (windowId, signal) => nativeHost.activate(windowId, signal),
    captureElement: (nativeId, signal) => nativeHost.captureElement(nativeId, signal),
    captureWindow: (windowId, signal) => nativeHost.captureWindow(windowId, signal),
    clear: (nativeId, signal) => nativeHost.clear(nativeId, signal),
    click: (nativeId, mode, signal) => nativeHost.click(nativeId, mode, signal),
    hitTest: (windowId, x, y, signal) => nativeHost.hitTest(windowId, x, y, signal),
    listAccessibilityActions(nativeId, signal) {
      if (!listAccessibilityActions) {
        throw new HostUnsupportedError(`Target "${session.target.id}" does not perform accessibility actions.`);
      }
      return listAccessibilityActions(nativeId, signal);
    },
    observe(request, signal) {
      if (!observe) {
        throw new HostUnsupportedError(`Target "${session.target.id}" does not support bounded observation.`);
      }
      return observe(request, signal);
    },
    releaseElements(nativeIds, signal) {
      if (!releaseElements) {
        throw new HostUnsupportedError(`Target "${session.target.id}" does not support releasing elements.`);
      }
      return releaseElements(nativeIds, signal);
    },
    performAccessibilityAction(nativeId, key, signal) {
      if (!performAccessibilityAction) {
        throw new HostUnsupportedError(`Target "${session.target.id}" does not perform accessibility actions.`);
      }
      return performAccessibilityAction(nativeId, key, signal);
    },
    sendKeys: (nativeId, text, signal) => nativeHost.sendKeys(nativeId, text, signal),
    snapshot: (nativeId, signal) => nativeHost.snapshot(nativeId, signal),
    ...(subscribe ? { subscribe } : {}),
  };
  const sessionSignal = session.commandAbortController.signal;
  return {
    capabilities: {
      accessibilityActions:
        features.accessibilityActions === true &&
        features.performAccessibilityAction === true &&
        !!listAccessibilityActions &&
        !!performAccessibilityAction,
      accessibilityClick: features.accessibilityClick,
      boundedObservation: features.boundedObservation === true && !!observe && !!releaseElements,
      elementCapture: features.elementScreenshot,
      keyboard: features.keyboard,
      physicalClick: features.physicalClick,
      windowCapture: features.screenshot,
    },
    cleanup: (description, run) => withCommandTimeout(run, session.desktopTimeouts.nativeCommand, description),
    command: (description, run) =>
      withCommandTimeout(run, session.desktopTimeouts.nativeCommand, description, {
        signal: AbortSignal.any([options.signal, sessionSignal]),
      }),
    contentPolicy: options.contentPolicy,
    currentWindowId: () => session.currentWindowId || undefined,
    host,
    input: (run) => sessions.runInputCommand(run),
    mutate: (description, run) =>
      sessions.runMutation(session, description, () =>
        withCommandTimeout(run, session.desktopTimeouts.nativeCommand, description, { signal: sessionSignal }),
      ),
    nativeTimeoutMs: () => session.desktopTimeouts.nativeCommand,
    previewGeneration: () => session.previewGeneration,
    quarantined: () => sessions.getQuarantine(session.target.id) !== undefined,
    signal: options.signal,
    state: session.operations,
  };
}

/** `GET furn/ops` lists what the session can do; `POST furn/ops/<name>` runs one operation. */
export function handleOperationRoute(method: string, segments: readonly string[], body: unknown, runtime: OperationRuntime): unknown {
  if (method === 'GET' && segments.length === 0) {
    return describeOperations(runtime.capabilities);
  }
  if (method === 'POST' && segments.length === 1) {
    return executeOperation(runtime, segments[0], body);
  }
  throw new WebDriverError(
    'unknown command',
    `No operation route matches ${method} /furn/ops/${segments.map((segment) => safeToken(segment)).join('/')}.`,
  );
}

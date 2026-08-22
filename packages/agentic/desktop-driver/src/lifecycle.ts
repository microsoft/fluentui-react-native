/**
 * Application lifecycle state machine.
 *
 * Every execution surface (WebdriverIO service, CLI, loopback test service) drives the same
 * machine and emits the same normalized events, so a run's `events.ndjson` reads identically
 * regardless of how it was started.
 */

import { DesktopDriverError } from './errors.ts';
import type {
  DesktopAppState,
  DesktopExitReason,
  DesktopLifecycleEvent,
  DesktopLifecycleEventType,
  DesktopOwnership,
  DesktopPlatform,
} from './types.ts';

const TRANSITIONS: Readonly<Record<DesktopAppState, readonly DesktopAppState[]>> = {
  created: ['starting', 'attaching', 'stopped'],
  starting: ['connected', 'exited', 'crashed', 'timed_out', 'stopping'],
  attaching: ['connected', 'exited', 'crashed', 'timed_out', 'stopping'],
  connected: ['ready', 'exited', 'crashed', 'timed_out', 'stopping'],
  ready: ['stopping', 'exited', 'crashed', 'timed_out'],
  stopping: ['stopped', 'exited', 'crashed'],
  stopped: [],
  exited: [],
  crashed: [],
  timed_out: ['stopping', 'stopped'],
};

/** Terminal states. A session in one of these cannot be reused. */
export function isTerminalState(state: DesktopAppState): boolean {
  return TRANSITIONS[state].length === 0;
}

export interface LifecycleOptions {
  platform: DesktopPlatform;
  ownership: DesktopOwnership;
  /** Bounded event history retained in memory for failure diagnostics. Defaults to 200. */
  historyLimit?: number;
  now?: () => Date;
}

export type LifecycleListener = (event: DesktopLifecycleEvent) => void;

export class DesktopLifecycle {
  private state: DesktopAppState = 'created';
  private readonly listeners = new Set<LifecycleListener>();
  private readonly history: DesktopLifecycleEvent[] = [];
  private readonly historyLimit: number;
  private readonly now: () => Date;
  private exitReason?: DesktopExitReason;

  readonly platform: DesktopPlatform;
  readonly ownership: DesktopOwnership;

  constructor(options: LifecycleOptions) {
    this.platform = options.platform;
    this.ownership = options.ownership;
    this.historyLimit = options.historyLimit ?? 200;
    this.now = options.now ?? (() => new Date());
  }

  get current(): DesktopAppState {
    return this.state;
  }

  get reason(): DesktopExitReason | undefined {
    return this.exitReason;
  }

  events(): readonly DesktopLifecycleEvent[] {
    return [...this.history];
  }

  on(listener: LifecycleListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Moves to `next`, rejecting transitions the machine does not define. */
  transition(next: DesktopAppState): void {
    if (this.state === next) {
      return;
    }
    if (!TRANSITIONS[this.state].includes(next)) {
      throw new DesktopDriverError(`Invalid desktop lifecycle transition ${this.state} -> ${next}`, {
        kind: 'lifecycle',
        detail: { from: this.state, to: next },
      });
    }
    this.state = next;
  }

  /** Emits a normalized event without changing state. */
  emit(
    type: DesktopLifecycleEventType,
    detail?: Record<string, unknown>,
    extra?: { sessionId?: string; processId?: number },
  ): DesktopLifecycleEvent {
    const event: DesktopLifecycleEvent = {
      type,
      timestamp: this.now().toISOString(),
      platform: this.platform,
      ownership: this.ownership,
      state: this.state,
      sessionId: extra?.sessionId,
      processId: extra?.processId,
      detail,
    };
    this.history.push(event);
    if (this.history.length > this.historyLimit) {
      this.history.splice(0, this.history.length - this.historyLimit);
    }
    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }

  /** Transitions and emits together for the common case. */
  advance(
    next: DesktopAppState,
    type: DesktopLifecycleEventType,
    detail?: Record<string, unknown>,
    extra?: { sessionId?: string; processId?: number },
  ): DesktopLifecycleEvent {
    this.transition(next);
    return this.emit(type, detail, extra);
  }

  /**
   * Records an observed termination.
   *
   * The reason is kept separate from the state because "the app is gone" and "why the app is
   * gone" fail a test very differently: a requested shutdown is expected, a crash is not.
   */
  observeExit(reason: DesktopExitReason, detail?: Record<string, unknown>): DesktopLifecycleEvent {
    if (isTerminalState(this.state)) {
      return this.emit(reason === 'monitorFailure' ? 'monitorError' : 'exitObserved', {
        ...detail,
        reason,
        duplicate: true,
      });
    }
    this.exitReason = reason;
    switch (reason) {
      case 'timedOut':
        this.transition('timed_out');
        return this.emit('timedOut', { ...detail, reason });
      case 'requestedShutdown':
        this.transition('stopped');
        return this.emit('shutdownCompleted', detail);
      case 'normalExit':
        this.transition('exited');
        return this.emit('exitObserved', { ...detail, reason });
      case 'crashed':
      case 'lostProcess':
        this.transition('crashed');
        return this.emit('crashObserved', { ...detail, reason });
      case 'monitorFailure':
      default:
        this.transition('crashed');
        return this.emit('monitorError', { ...detail, reason });
    }
  }

  /** Records that a bounded readiness or shutdown operation exhausted its deadline. */
  observeTimeout(detail?: Record<string, unknown>): DesktopLifecycleEvent {
    return this.observeExit('timedOut', detail);
  }
}

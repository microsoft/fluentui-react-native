import { randomUUID } from 'node:crypto';

import type {
  ApplicationLease,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  NativeElementScope,
  NativeElementSnapshot,
} from '../host/types.js';
import { OperationSessionState } from '../operations/sessionState.js';
import { createInputState } from '../protocol/actions.js';
import type { WebDriverInputState } from '../protocol/actions.js';
import { WebDriverError } from '../protocol/errors.js';
import {
  attachFailureEffect,
  attachMutationReport,
  createMutationReport,
  dispositionForEffect,
  readProviderQuarantine,
} from '../protocol/settlement.js';
import type { MutationEffect } from '../protocol/settlement.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { DesktopClickMode, DesktopTimeouts, WebDriverTimeouts } from '../protocol/types.js';

export type ElementRecord = {
  id: string;
  nativeId: string;
  previewGeneration: number;
  scope: NativeElementScope;
};

/**
 * Why a target refuses mutations. A target is quarantined when a mutating command ended without the provider being
 * able to say whether it changed the application, so replaying it or issuing further input could compound the change.
 * `origin` is `command` when the recorded command is the one that did not settle, and `provider` when the provider
 * quarantined itself earlier and refused the recorded command.
 */
export type QuarantineRecord = {
  command: string;
  effect: MutationEffect;
  message: string;
  origin: 'command' | 'provider';
  sessionId: string;
  since: string;
  targetId: string;
};

export type MutationOptions = {
  /** Recovery commands run while quarantined; they can extend a quarantine but never lift it. */
  recovery?: boolean;
};

/** The grant that created a session on a protected service. Only that grant may address the session afterwards. */
export type SessionOwner = {
  grantId: string;
  label: string;
};

/** Who has a target reserved, as far as a contending caller may be told. `label` is set only for a grant's session. */
type TargetHolder = {
  label?: string;
  since: string;
};

export type SessionManagerOptions = {
  /**
   * Removes session ids from the quarantine details a caller receives. A protected service sets this, because the id of
   * another grant's session must not reach a caller that is only contending for the same target.
   */
  redactSessionIds?: boolean;
};

export type DesktopSession = {
  clickMode: DesktopClickMode;
  createdAt: string;
  currentWindowId: string;
  desktopTimeouts: DesktopTimeouts;
  elements: Map<string, ElementRecord>;
  elementIdsByNativeId: Map<string, string>;
  hostInfo: DesktopHostInfo;
  id: string;
  inputState: WebDriverInputState;
  issuedElementIds: Set<string>;
  lease: ApplicationLease;
  /** What the operation layer remembers about this session: its references, pending releases, and journal. */
  operations: OperationSessionState;
  /** Set on a protected service; absent when the service does not authenticate callers. */
  owner?: SessionOwner;
  previewGeneration: number;
  story: { previewGeneration: number; runId: string; storyId: string } | null;
  target: DesktopTarget;
  timeouts: WebDriverTimeouts;
  windows: DesktopWindow[];
};

export class SessionManager {
  private readonly sessions = new Map<string, DesktopSession>();
  private readonly sessionsByTarget = new Map<string, string>();
  private readonly reservedTargets = new Map<string, TargetHolder>();
  private readonly commandQueues = new Map<string, Promise<void>>();
  private readonly inFlightCreates = new Set<Promise<void>>();
  private readonly revokedOwners = new Set<string>();
  private readonly quarantines = new Map<string, QuarantineRecord>();
  private inputQueue: Promise<void> = Promise.resolve();
  private closing = false;
  private readonly redactSessionIds: boolean;

  constructor(options: SessionManagerOptions = {}) {
    this.redactSessionIds = options.redactSessionIds === true;
  }

  create(
    target: DesktopTarget,
    hostInfo: DesktopHostInfo,
    clickMode: DesktopClickMode,
    launchMode: 'attach' | 'launch',
    owner?: SessionOwner,
  ): Promise<DesktopSession> {
    if (this.closing) {
      return Promise.reject(new WebDriverError('session not created', 'Desktop Driver is shutting down.'));
    }
    // Checked in the same tick that the create registers as in flight, so a create is either rejected here or awaited
    // by deleteOwnedBy.
    if (owner && this.revokedOwners.has(owner.grantId)) {
      return Promise.reject(new WebDriverError('session not created', 'The grant for this request was revoked.'));
    }
    const result = this.createSession(target, hostInfo, clickMode, launchMode, owner);
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    this.inFlightCreates.add(settled);
    void settled.finally(() => this.inFlightCreates.delete(settled));
    return result;
  }

  beginClose(): void {
    this.closing = true;
  }

  async waitForCreates(): Promise<void> {
    await Promise.all(this.inFlightCreates);
  }

  private async createSession(
    target: DesktopTarget,
    hostInfo: DesktopHostInfo,
    clickMode: DesktopClickMode,
    launchMode: 'attach' | 'launch',
    owner?: SessionOwner,
  ): Promise<DesktopSession> {
    if (target.launchModes && !target.launchModes.includes(launchMode)) {
      throw new WebDriverError('session not created', `Target "${target.id}" does not allow ${launchMode} sessions.`);
    }
    const quarantine = this.quarantines.get(target.id);
    if (quarantine) {
      throw createQuarantineError('session not created', quarantine, this.redactSessionIds);
    }
    if (this.sessionsByTarget.has(target.id) || this.reservedTargets.has(target.id)) {
      throw this.createBusyError(target.id);
    }

    this.reservedTargets.set(target.id, { ...(owner ? { label: owner.label } : {}), since: new Date().toISOString() });
    let lease: ApplicationLease | undefined;
    let releaseReservation = true;
    let leasePromise: Promise<ApplicationLease> | undefined;
    try {
      lease = await withCommandTimeout(
        (signal) => {
          leasePromise = launchMode === 'attach' ? target.host.attach(target, signal) : target.host.launch(target, signal);
          return leasePromise;
        },
        target.launchTimeoutMs ?? 120_000,
        `${launchMode === 'attach' ? 'Attaching to' : 'Launching'} target "${target.id}"`,
      );
      const activeLease = lease;
      const windows = await withCommandTimeout(
        (signal) => target.host.windows(activeLease, signal),
        10_000,
        `Reading windows for target "${target.id}"`,
      );
      if (windows.length === 0) {
        throw new WebDriverError('session not created', `Target "${target.id}" did not expose any windows.`);
      }
      if (this.closing) {
        throw new WebDriverError('session not created', 'Desktop Driver shut down while the target was starting.');
      }
      const session: DesktopSession = {
        clickMode,
        createdAt: new Date().toISOString(),
        currentWindowId: windows[0].id,
        desktopTimeouts: {
          appLaunch: target.launchTimeoutMs ?? 120_000,
          nativeCommand: 10_000,
          stableLayout: 1_000,
          storyRender: 30_000,
        },
        elements: new Map(),
        elementIdsByNativeId: new Map(),
        hostInfo,
        id: randomUUID(),
        inputState: createInputState(),
        issuedElementIds: new Set(),
        lease,
        operations: new OperationSessionState(),
        ...(owner ? { owner } : {}),
        previewGeneration: 0,
        story: null,
        target,
        timeouts: {
          implicit: 0,
          pageLoad: 300_000,
          script: 30_000,
        },
        windows,
      };
      this.sessions.set(session.id, session);
      this.sessionsByTarget.set(target.id, session.id);
      return session;
    } catch (error) {
      await this.runInputCommand(() =>
        withCommandTimeout((signal) => target.host.releaseActions(signal), 10_000, `Releasing input for target "${target.id}"`),
      ).catch(() => undefined);
      if (lease) {
        const failedLease = lease;
        await withCommandTimeout(
          (signal) => target.host.closeApplication(failedLease, signal),
          10_000,
          `Closing failed target "${target.id}"`,
        ).catch(() => undefined);
      } else if (leasePromise) {
        releaseReservation = false;
        void leasePromise
          .then(async (lateLease) => {
            await this.runInputCommand(() =>
              withCommandTimeout((signal) => target.host.releaseActions(signal), 10_000, `Releasing late input for target "${target.id}"`),
            ).catch(() => undefined);
            await withCommandTimeout(
              (signal) => target.host.closeApplication(lateLease, signal),
              10_000,
              `Closing late target "${target.id}"`,
            ).catch(() => undefined);
          })
          .catch(() => undefined)
          .finally(() => this.reservedTargets.delete(target.id));
      }
      throw error;
    } finally {
      if (releaseReservation) {
        this.reservedTargets.delete(target.id);
      }
    }
  }

  /**
   * Why a target cannot be opened right now. The holder is described only by the label its grant chose, so a caller that
   * is merely contending learns who to wait for without learning any grant or session identifier.
   */
  private createBusyError(targetId: string): WebDriverError {
    const sessionId = this.sessionsByTarget.get(targetId);
    const session = sessionId ? this.sessions.get(sessionId) : undefined;
    const holder: TargetHolder | undefined =
      this.reservedTargets.get(targetId) ??
      (session ? { ...(session.owner ? { label: session.owner.label } : {}), since: session.createdAt } : undefined);
    return new WebDriverError('session not created', `Target "${targetId}" already has an active session.`, {
      reason: 'target-busy',
      ...(this.redactSessionIds && holder?.label ? { holder: { label: holder.label, since: holder.since } } : {}),
    });
  }

  get(id: string): DesktopSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw missingSession(id);
    }
    return session;
  }

  /**
   * Looks a session up for a caller. A session created by a grant is visible only to that grant; every other caller
   * gets the same answer as for an id that does not exist, so a valid grant cannot probe for or address another
   * grant's session.
   */
  getFor(id: string, grantId: string | undefined): DesktopSession {
    const session = this.get(id);
    if (session.owner && session.owner.grantId !== grantId) {
      throw missingSession(id);
    }
    return session;
  }

  /** The quarantine as a caller may see it. */
  describeQuarantine(record: QuarantineRecord): Omit<QuarantineRecord, 'sessionId'> & { sessionId?: string } {
    if (!this.redactSessionIds) {
      return { ...record };
    }
    const { sessionId: _sessionId, ...visible } = record;
    return visible;
  }

  runCommand<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.commandQueues.get(sessionId) ?? Promise.resolve();
    const result = previous.catch(() => undefined).then(operation);
    const tail = result.then(
      () => undefined,
      () => undefined,
    );
    this.commandQueues.set(sessionId, tail);
    void tail.finally(() => {
      if (this.commandQueues.get(sessionId) === tail) {
        this.commandQueues.delete(sessionId);
      }
    });
    return result;
  }

  runInputCommand<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.inputQueue.catch(() => undefined).then(operation);
    this.inputQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  getQuarantine(targetId: string): QuarantineRecord | undefined {
    return this.quarantines.get(targetId);
  }

  /** Rejects with a settled "rejected" failure when the session's target is quarantined. */
  assertMutable(session: DesktopSession): void {
    const record = this.quarantines.get(session.target.id);
    if (record) {
      throw createQuarantineError('unknown error', record, this.redactSessionIds);
    }
  }

  /**
   * Runs one mutating host command. The guard is evaluated when the command runs, not when it is queued, so a command
   * queued behind one that turns out indeterminate is blocked. A failure is settled into a disposition: only a
   * definitive "none" is safe to retry, "applied" means the change landed despite the failure, and anything else
   * quarantines the target. A provider that quarantined itself also quarantines the target, even when it refused the
   * command before dispatching anything.
   */
  async runMutation<T>(
    session: DesktopSession,
    description: string,
    operation: () => Promise<T>,
    options: MutationOptions = {},
  ): Promise<T> {
    if (!options.recovery) {
      this.assertMutable(session);
    }
    try {
      return await operation();
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      const report = createMutationReport(failure, false);
      if (dispositionForEffect(report.effect) === 'indeterminate') {
        this.quarantine(session, description, report.effect, failure, 'command');
      } else if (readProviderQuarantine(failure)) {
        this.quarantine(session, description, 'unknown', failure, 'provider');
      }
      throw attachMutationReport(failure, { ...report, quarantined: this.quarantines.has(session.target.id) });
    }
  }

  private quarantine(
    session: DesktopSession,
    command: string,
    effect: MutationEffect,
    failure: Error,
    origin: QuarantineRecord['origin'],
  ): void {
    if (this.quarantines.has(session.target.id)) {
      return;
    }
    this.quarantines.set(session.target.id, {
      command,
      effect,
      message: truncate(failure.message, 300),
      origin,
      sessionId: session.id,
      since: new Date().toISOString(),
      targetId: session.target.id,
    });
  }

  async delete(id: string): Promise<void> {
    const session = this.get(id);
    this.reservedTargets.set(session.target.id, {
      ...(session.owner ? { label: session.owner.label } : {}),
      since: session.createdAt,
    });
    const failures: unknown[] = [];
    try {
      try {
        // The quarantine record keeps this description and the failure text, and other callers can read both, so
        // neither names the session.
        await this.runInputCommand(() =>
          this.runMutation(
            session,
            'Releasing input while closing the session',
            () =>
              withCommandTimeout(
                (signal) => session.target.host.releaseActions(signal),
                session.desktopTimeouts.nativeCommand,
                'Releasing input while closing the session',
              ),
            { recovery: true },
          ),
        );
      } catch (error) {
        failures.push(error);
      }
      try {
        await withCommandTimeout(
          (signal) => session.target.host.closeApplication(session.lease, signal),
          session.desktopTimeouts.nativeCommand,
          `Closing application for session "${id}"`,
        );
      } catch (error) {
        failures.push(error);
      }
      if (failures.length === 1) {
        throw failures[0];
      }
      if (failures.length > 1) {
        throw new AggregateError(failures, `Failed to close session "${id}".`);
      }
      this.sessions.delete(id);
      this.sessionsByTarget.delete(session.target.id);
      // Closing a launched application verifies the exit of the exact incarnation the quarantine was raised against.
      // An attached application is left running, so its quarantine stays until it is explicitly recovered.
      if (session.lease.ownership === 'launched') {
        this.quarantines.delete(session.target.id);
      }
    } finally {
      this.reservedTargets.delete(session.target.id);
    }
  }

  async deleteAll(): Promise<void> {
    await this.deleteWhere(() => true, 'One or more desktop sessions failed to close.');
  }

  /**
   * Closes every session a grant created. Used when the grant is revoked, since nothing else can address them. A session
   * that is still launching registers only when it finishes, so creates in flight are awaited before looking.
   */
  async deleteOwnedBy(grantId: string): Promise<void> {
    this.revokedOwners.add(grantId);
    await this.waitForCreates();
    await this.deleteWhere((session) => session.owner?.grantId === grantId, 'One or more sessions of a revoked grant failed to close.');
  }

  private async deleteWhere(predicate: (session: DesktopSession) => boolean, summary: string): Promise<void> {
    const failures: unknown[] = [];
    for (const [id, session] of Array.from(this.sessions.entries())) {
      if (!predicate(session)) {
        continue;
      }
      try {
        // Queued behind the session's own commands, so closing never overlaps native work whose caller has left.
        await this.runCommand(id, async () => {
          if (this.sessions.has(id)) {
            await this.delete(id);
          }
        });
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, summary);
    }
  }

  registerElement(session: DesktopSession, snapshot: NativeElementSnapshot): ElementRecord {
    const existingId = session.elementIdsByNativeId.get(snapshot.id);
    if (existingId) {
      return session.elements.get(existingId)!;
    }
    const record: ElementRecord = {
      id: randomUUID(),
      nativeId: snapshot.id,
      previewGeneration: session.previewGeneration,
      scope: snapshot.scope,
    };
    session.elements.set(record.id, record);
    session.elementIdsByNativeId.set(record.nativeId, record.id);
    session.issuedElementIds.add(record.id);
    // A WebDriver client now holds this provider record, and the operation layer may release only records it created.
    session.operations.ledger.markExternal(snapshot.id);
    return record;
  }

  resolveElement(session: DesktopSession, id: string): ElementRecord {
    const element = session.elements.get(id);
    if (!element) {
      throw new WebDriverError(
        session.issuedElementIds.has(id) ? 'stale element reference' : 'no such element',
        `Element "${id}" is not available in this session.`,
      );
    }
    if (element.scope === 'preview' && element.previewGeneration !== session.previewGeneration) {
      throw new WebDriverError('stale element reference', `Element "${id}" is no longer attached to the current view.`);
    }
    return element;
  }

  invalidatePreview(session: DesktopSession): void {
    session.previewGeneration += 1;
    for (const [id, element] of session.elements) {
      if (element.scope === 'preview') {
        session.elements.delete(id);
        session.elementIdsByNativeId.delete(element.nativeId);
      }
    }
  }
}

function createQuarantineError(
  code: 'session not created' | 'unknown error',
  record: QuarantineRecord,
  redactSessionId: boolean,
): WebDriverError {
  const cause =
    record.origin === 'provider'
      ? `the native provider quarantined itself and refused "${record.command}" (${record.message})`
      : `"${record.command}" ended without confirming whether it changed the application (${record.message})`;
  const { sessionId: _sessionId, ...withoutSessionId } = record;
  const error = new WebDriverError(
    code,
    `Target "${record.targetId}" is quarantined: ${cause}. Mutations stay blocked until the target is recovered or its launched application is closed.`,
    { quarantine: redactSessionId ? withoutSessionId : { ...record }, reason: 'target-quarantined' },
  );
  // The blocked command never reached the host, so it is a settled rejection even though the target stays quarantined.
  attachFailureEffect(error, 'none');
  return attachMutationReport(error, createMutationReport(error, true));
}

function missingSession(id: string): WebDriverError {
  // Both "no such session" and "another grant's session" come from here so the answers, stack included, are identical.
  const error = new WebDriverError('invalid session id', `Session "${id}" does not exist.`);
  error.stack = '';
  return error;
}

function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

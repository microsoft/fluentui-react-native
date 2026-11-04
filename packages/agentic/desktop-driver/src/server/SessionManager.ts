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
import { applicationOf } from './settlementJournal.js';
import type { ProbeApplication, QuarantineRecord, SettlementJournal } from './settlementJournal.js';

export type ElementRecord = {
  id: string;
  nativeId: string;
  previewGeneration: number;
  scope: NativeElementScope;
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
  grantId?: string;
  lifecycle: 'opening' | 'active' | 'draining';
  label?: string;
  since: string;
};

export type SessionManagerOptions = {
  /**
   * Closes a grant's session after this many milliseconds without a request for it. The clock runs only while none of the
   * session's requests is queued or running, so a long command never expires its own session. Sessions without an owner
   * never expire. 0 or absent disables expiry.
   */
  idleTimeoutMs?: number;
  /**
   * Removes session ids from the quarantine details a caller receives. A protected service sets this, because the id of
   * another grant's session must not reach a caller that is only contending for the same target.
   */
  redactSessionIds?: boolean;
  /**
   * Durable settlement state. When set, every mutation is recorded before it is dispatched and every quarantine is
   * recorded when it is raised, so both survive a restart of the service.
   */
  journal?: SettlementJournal;
  /** Proves that a quarantined application incarnation has exited, which lifts its quarantine. */
  probeApplication?: ProbeApplication;
};

/** The evidence an operator gives for lifting a quarantine. */
export type RecoveryEvidence = 'application-exited' | 'operator';

export type RecoverTargetRequest = {
  evidence: RecoveryEvidence;
  /** The id of the quarantine the operator inspected; a different or newer quarantine is never lifted. */
  quarantineId: string;
};

export type RecoverTargetResult = {
  evidence: RecoveryEvidence;
  quarantine: QuarantineRecord;
};

export type DesktopSession = {
  commandAbortController: AbortController;
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
  lifecycle: 'active' | 'draining' | 'closed';
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
  private readonly inFlightCreates = new Map<Promise<void>, { controller: AbortController; grantId?: string }>();
  private readonly revokedOwners = new Set<string>();
  private readonly quarantines = new Map<string, QuarantineRecord>();
  private inputQueue: Promise<void> = Promise.resolve();
  private readonly pendingCommands = new Map<string, number>();
  private readonly idleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly loadedTargets = new Map<string, Promise<void>>();
  private readonly mutatingTargets = new Set<string>();
  private readonly recoveringTargets = new Set<string>();
  private closing = false;
  private readonly idleTimeoutMs: number;
  private readonly journal: SettlementJournal | undefined;
  private readonly probeApplication: ProbeApplication | undefined;
  private readonly redactSessionIds: boolean;

  constructor(options: SessionManagerOptions = {}) {
    this.idleTimeoutMs = options.idleTimeoutMs ?? 0;
    this.journal = options.journal;
    this.probeApplication = options.probeApplication;
    this.redactSessionIds = options.redactSessionIds === true;
  }

  /**
   * Restores what an earlier run of the service recorded for a target: its quarantine, or a mutation that never
   * settled, which quarantines the target. Each target is read once; a read that fails is retried next time.
   */
  loadTarget(targetId: string): Promise<void> {
    const journal = this.journal;
    if (!journal) {
      return Promise.resolve();
    }
    let loading = this.loadedTargets.get(targetId);
    if (!loading) {
      loading = journal.load(targetId).then((record) => {
        if (record && !this.quarantines.has(targetId)) {
          this.quarantines.set(targetId, record);
        }
      });
      this.loadedTargets.set(targetId, loading);
      loading.catch(() => this.loadedTargets.delete(targetId));
    }
    return loading;
  }

  /**
   * Lifts a quarantine. Only the trusted operator calls this; no grant or WebDriver route reaches it. `application-exited`
   * lifts it only when the probe proves the recorded application incarnation has exited. The durable records are removed
   * before the quarantine is lifted, so a failure leaves the target quarantined.
   */
  async recoverTarget(targetId: string, request: RecoverTargetRequest): Promise<RecoverTargetResult> {
    await this.loadTarget(targetId);
    let record = this.requireQuarantine(targetId, request.quarantineId);
    if (request.evidence === 'application-exited') {
      const state = record.application ? await this.probe(record.application) : 'unknown';
      if (state !== 'exited') {
        throw new Error(`The application of target "${targetId}" was not proven to have exited (${state}).`);
      }
      record = this.requireQuarantine(targetId, request.quarantineId);
    }
    // No mutation, recovery commands included, may start while the records are being removed.
    this.recoveringTargets.add(targetId);
    try {
      await this.journal?.clear(targetId);
      this.quarantines.delete(targetId);
    } finally {
      this.recoveringTargets.delete(targetId);
    }
    return { evidence: request.evidence, quarantine: { ...record } };
  }

  private requireQuarantine(targetId: string, quarantineId: string): QuarantineRecord {
    const record = this.quarantines.get(targetId);
    if (!record || record.id !== quarantineId) {
      throw new Error(`Target "${targetId}" has no quarantine with that id.`);
    }
    if (this.mutatingTargets.has(targetId) || this.recoveringTargets.has(targetId)) {
      throw new Error(`Target "${targetId}" has a mutation in flight.`);
    }
    return record;
  }

  private async probe(application: NonNullable<QuarantineRecord['application']>): Promise<'exited' | 'running' | 'unknown'> {
    if (!this.probeApplication) {
      return 'unknown';
    }
    try {
      return await this.probeApplication({ processId: application.processId, processStartedAt: application.processStartedAt });
    } catch {
      return 'unknown';
    }
  }

  /**
   * Lifts the quarantine of a target that nothing holds when the exact application incarnation it was raised against
   * has exited. Anything less than proof leaves the quarantine for the operator.
   */
  private async clearExitedQuarantine(targetId: string): Promise<void> {
    const record = this.quarantines.get(targetId);
    if (!record?.application || !this.probeApplication || this.isHeld(targetId)) {
      return;
    }
    if ((await this.probe(record.application)) !== 'exited') {
      return;
    }
    if (this.quarantines.get(targetId) !== record || this.isHeld(targetId)) {
      return;
    }
    try {
      await this.journal?.clear(targetId);
    } catch {
      return;
    }
    if (this.quarantines.get(targetId) === record) {
      this.quarantines.delete(targetId);
    }
  }

  private isHeld(targetId: string): boolean {
    return (
      this.sessionsByTarget.has(targetId) ||
      this.reservedTargets.has(targetId) ||
      this.mutatingTargets.has(targetId) ||
      this.recoveringTargets.has(targetId)
    );
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
    const controller = new AbortController();
    const result = this.createSession(target, hostInfo, clickMode, launchMode, owner, controller.signal);
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    this.inFlightCreates.set(settled, { controller, ...(owner ? { grantId: owner.grantId } : {}) });
    void settled.finally(() => this.inFlightCreates.delete(settled));
    return result;
  }

  beginClose(): void {
    this.closing = true;
    for (const timer of this.idleTimers.values()) {
      clearTimeout(timer);
    }
    this.idleTimers.clear();
    for (const { controller } of this.inFlightCreates.values()) {
      controller.abort();
    }
    for (const session of this.sessions.values()) {
      this.beginDraining(session);
    }
  }

  async waitForCreates(grantId?: string): Promise<void> {
    while (true) {
      const pending = Array.from(this.inFlightCreates.entries())
        .filter(([, create]) => grantId === undefined || create.grantId === grantId)
        .map(([promise]) => promise);
      if (pending.length === 0) {
        return;
      }
      await Promise.all(pending);
    }
  }

  private async createSession(
    target: DesktopTarget,
    hostInfo: DesktopHostInfo,
    clickMode: DesktopClickMode,
    launchMode: 'attach' | 'launch',
    owner?: SessionOwner,
    signal?: AbortSignal,
  ): Promise<DesktopSession> {
    if (target.launchModes && !target.launchModes.includes(launchMode)) {
      throw new WebDriverError('session not created', `Target "${target.id}" does not allow ${launchMode} sessions.`);
    }
    try {
      await this.loadTarget(target.id);
    } catch {
      throw new WebDriverError('session not created', `The settlement journal of target "${target.id}" could not be read.`);
    }
    await this.clearExitedQuarantine(target.id);
    if (this.closing) {
      throw new WebDriverError('session not created', 'Desktop Driver is shutting down.');
    }
    if (owner && this.revokedOwners.has(owner.grantId)) {
      throw new WebDriverError('session not created', 'The grant for this request was revoked.');
    }
    const quarantine = this.quarantines.get(target.id);
    if (quarantine) {
      throw createQuarantineError('session not created', quarantine, this.redactSessionIds);
    }
    if (this.sessionsByTarget.has(target.id) || this.reservedTargets.has(target.id)) {
      throw this.createBusyError(target.id);
    }

    this.reservedTargets.set(target.id, {
      ...(owner ? { grantId: owner.grantId, label: owner.label } : {}),
      lifecycle: 'opening',
      since: new Date().toISOString(),
    });
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
        { signal },
      );
      const activeLease = lease;
      const windows = await withCommandTimeout(
        (signal) => target.host.windows(activeLease, signal),
        10_000,
        `Reading windows for target "${target.id}"`,
        { signal },
      );
      if (windows.length === 0) {
        throw new WebDriverError('session not created', `Target "${target.id}" did not expose any windows.`);
      }
      if (this.closing) {
        throw new WebDriverError('session not created', 'Desktop Driver shut down while the target was starting.');
      }
      if (owner && this.revokedOwners.has(owner.grantId)) {
        throw new WebDriverError('session not created', 'The grant for this request was revoked.');
      }
      const session: DesktopSession = {
        clickMode,
        commandAbortController: new AbortController(),
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
        lifecycle: 'active',
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
      this.armIdleTimer(session.id);
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
        await leasePromise
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
      (session
        ? {
            ...(session.owner ? { grantId: session.owner.grantId, label: session.owner.label } : {}),
            lifecycle: session.lifecycle === 'closed' ? 'draining' : session.lifecycle,
            since: session.createdAt,
          }
        : undefined);
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

  assertActive(session: DesktopSession): void {
    if (session.lifecycle !== 'active') {
      throw new WebDriverError('invalid session id', `Session "${session.id}" is not active.`);
    }
  }

  /** The quarantine as a caller may see it. */
  describeQuarantine(record: QuarantineRecord): QuarantineRecord {
    return visibleQuarantine(record, this.redactSessionIds);
  }

  runCommand<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    // Every request for a session passes through here, so queuing one renews the session's idle clock.
    this.pendingCommands.set(sessionId, (this.pendingCommands.get(sessionId) ?? 0) + 1);
    this.clearIdleTimer(sessionId);
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
      const remaining = (this.pendingCommands.get(sessionId) ?? 1) - 1;
      if (remaining > 0) {
        this.pendingCommands.set(sessionId, remaining);
      } else {
        this.pendingCommands.delete(sessionId);
        this.armIdleTimer(sessionId);
      }
    });
    return result;
  }

  /** Starts the idle clock of an active grant's session that has no request queued or running. */
  private armIdleTimer(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (
      this.idleTimeoutMs <= 0 ||
      this.closing ||
      !session?.owner ||
      session.lifecycle !== 'active' ||
      this.pendingCommands.has(sessionId)
    ) {
      return;
    }
    this.clearIdleTimer(sessionId);
    const timer = setTimeout(() => {
      this.idleTimers.delete(sessionId);
      void this.expireIdle(sessionId);
    }, this.idleTimeoutMs);
    // An idle clock alone never keeps the process alive.
    timer.unref?.();
    this.idleTimers.set(sessionId, timer);
  }

  private clearIdleTimer(sessionId: string): void {
    const timer = this.idleTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(sessionId);
    }
  }

  /**
   * Closes an idle session the way DELETE would. Draining starts at once, so a request that arrives while the close is
   * queued is refused rather than renewing a session that has already expired. A session that fails to close stays
   * tracked and draining, and service shutdown retries it, as for a revoked grant.
   */
  private async expireIdle(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.lifecycle !== 'active' || this.pendingCommands.has(sessionId)) {
      return;
    }
    this.beginDraining(session);
    await this.deleteWhere(({ id }) => id === sessionId, 'An idle session failed to close.').catch(() => undefined);
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
    this.assertActive(session);
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
    const targetId = session.target.id;
    const recovering = this.quarantines.get(targetId);
    if (this.recoveringTargets.has(targetId) && recovering) {
      throw createQuarantineError('unknown error', recovering, this.redactSessionIds);
    }
    const journal = this.journal;
    // A mutation record left by an earlier failure already keeps the target quarantined across a restart; only recovery
    // commands get past the quarantine, and they need no record of their own.
    const journaled = journal !== undefined && !journal.hasMutation(targetId);
    // Marked before the record is written, so recovery can never interleave with a mutation that is being recorded.
    this.mutatingTargets.add(targetId);
    try {
      if (journaled) {
        try {
          await journal.beginMutation({ application: applicationOf(session.lease), command: description, sessionId: session.id, targetId });
        } catch (error) {
          throw createJournalRefusal(error);
        }
      }
      let result: T;
      try {
        result = await operation();
      } catch (error) {
        const failure = error instanceof Error ? error : new Error(String(error));
        const report = createMutationReport(failure, false);
        let raised: QuarantineRecord | undefined;
        if (dispositionForEffect(report.effect) === 'indeterminate') {
          raised = this.quarantine(session, description, report.effect, failure.message, 'command');
        } else if (readProviderQuarantine(failure)) {
          raised = this.quarantine(session, description, 'unknown', failure.message, 'provider');
        }
        if (journaled) {
          await this.settleJournal(session, description, raised);
        }
        throw attachMutationReport(failure, { ...report, quarantined: this.quarantines.has(targetId) });
      }
      if (journaled) {
        await this.settleJournal(session, description, undefined);
      }
      return result;
    } finally {
      this.mutatingTargets.delete(targetId);
    }
  }

  /**
   * Records how a journaled mutation settled. A quarantine it raised is recorded before the mutation record is removed,
   * and when it cannot be, the mutation record stays so a restart still quarantines the target. A mutation record that
   * cannot be removed quarantines the target, because a restart would otherwise find it and quarantine the target then.
   */
  private async settleJournal(session: DesktopSession, description: string, raised: QuarantineRecord | undefined): Promise<void> {
    const journal = this.journal!;
    const targetId = session.target.id;
    if (raised) {
      try {
        await journal.recordQuarantine(raised);
      } catch {
        return;
      }
    }
    try {
      await journal.endMutation(targetId);
    } catch (error) {
      this.quarantine(
        session,
        description,
        'applied',
        `The settlement journal could not record that this mutation settled: ${error instanceof Error ? error.message : String(error)}`,
        'journal',
      );
    }
  }

  private quarantine(
    session: DesktopSession,
    command: string,
    effect: MutationEffect,
    message: string,
    origin: QuarantineRecord['origin'],
  ): QuarantineRecord | undefined {
    if (this.quarantines.has(session.target.id)) {
      return undefined;
    }
    const application = applicationOf(session.lease);
    const record: QuarantineRecord = {
      ...(application ? { application } : {}),
      command,
      effect,
      id: randomUUID(),
      message: truncate(message, 300),
      origin,
      sessionId: session.id,
      since: new Date().toISOString(),
      targetId: session.target.id,
    };
    this.quarantines.set(session.target.id, record);
    return record;
  }

  async delete(id: string): Promise<void> {
    const session = this.get(id);
    this.beginDraining(session);
    this.reservedTargets.set(session.target.id, {
      ...(session.owner ? { grantId: session.owner.grantId } : {}),
      lifecycle: 'draining',
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
      session.lifecycle = 'closed';
      this.sessions.delete(id);
      this.sessionsByTarget.delete(session.target.id);
      // Closing a launched application verifies the exit of the exact incarnation the quarantine was raised against.
      // An attached application is left running, so its quarantine stays until it is explicitly recovered.
      // Its durable records go first, so a target whose records remain stays quarantined until a probe or the operator
      // lifts it.
      if (session.lease.ownership === 'launched' && this.quarantines.has(session.target.id)) {
        try {
          await this.journal?.clear(session.target.id);
          this.quarantines.delete(session.target.id);
        } catch {
          // The application has exited, so the next session for this target can prove that and lift the quarantine.
        }
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
    for (const [targetId, reservation] of this.reservedTargets) {
      if (reservation.grantId === grantId) {
        this.reservedTargets.set(targetId, { ...reservation, lifecycle: 'draining' });
      }
    }
    for (const create of this.inFlightCreates.values()) {
      if (create.grantId === grantId) {
        create.controller.abort();
      }
    }
    for (const session of this.sessions.values()) {
      if (session.owner?.grantId === grantId) {
        this.beginDraining(session);
      }
    }
    await this.waitForCreates(grantId);
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

  private beginDraining(session: DesktopSession): void {
    if (session.lifecycle === 'active') {
      session.lifecycle = 'draining';
      session.commandAbortController.abort();
    }
    this.reservedTargets.set(session.target.id, {
      ...(session.owner ? { grantId: session.owner.grantId, label: session.owner.label } : {}),
      lifecycle: 'draining',
      since: session.createdAt,
    });
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
  const cause = {
    command: `"${record.command}" ended without confirming whether it changed the application (${record.message})`,
    interrupted: `the service stopped before "${record.command}" settled (${record.message})`,
    journal: `the service could not record that "${record.command}" settled (${record.message})`,
    provider: `the native provider quarantined itself and refused "${record.command}" (${record.message})`,
  }[record.origin];
  const error = new WebDriverError(
    code,
    `Target "${record.targetId}" is quarantined: ${cause}. Mutations stay blocked until the target is recovered or its launched application is closed.`,
    { quarantine: visibleQuarantine(record, redactSessionId), reason: 'target-quarantined' },
  );
  // The blocked command never reached the host, so it is a settled rejection even though the target stays quarantined.
  attachFailureEffect(error, 'none');
  return attachMutationReport(error, createMutationReport(error, true));
}

/** A quarantine as a caller may see it. Redaction also removes the application's process identity. */
function visibleQuarantine(record: QuarantineRecord, redact: boolean): QuarantineRecord {
  if (!redact) {
    return { ...record };
  }
  const { application: _application, sessionId: _sessionId, ...visible } = record;
  return visible;
}

/** The journal could not record a mutation before dispatch, so nothing was sent and the target is unchanged. */
function createJournalRefusal(cause: unknown): WebDriverError {
  const error = new WebDriverError(
    'unknown error',
    `The settlement journal could not record this mutation, so it was not dispatched (${truncate(cause instanceof Error ? cause.message : String(cause), 300)}).`,
    { reason: 'journal-unavailable' },
  );
  attachFailureEffect(error, 'none');
  return attachMutationReport(error, createMutationReport(error, false));
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

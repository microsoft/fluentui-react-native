import { randomUUID } from 'node:crypto';

import type {
  ApplicationLease,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  NativeElementScope,
  NativeElementSnapshot,
} from '../host/types.js';
import { createInputState } from '../protocol/actions.js';
import type { WebDriverInputState } from '../protocol/actions.js';
import { WebDriverError } from '../protocol/errors.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { DesktopClickMode, DesktopTimeouts, WebDriverTimeouts } from '../protocol/types.js';

export type ElementRecord = {
  id: string;
  nativeId: string;
  previewGeneration: number;
  scope: NativeElementScope;
};

export type DesktopSession = {
  clickMode: DesktopClickMode;
  currentWindowId: string;
  desktopTimeouts: DesktopTimeouts;
  elements: Map<string, ElementRecord>;
  elementIdsByNativeId: Map<string, string>;
  hostInfo: DesktopHostInfo;
  id: string;
  inputState: WebDriverInputState;
  lease: ApplicationLease;
  previewGeneration: number;
  story: { runId: string; storyId: string } | null;
  target: DesktopTarget;
  timeouts: WebDriverTimeouts;
  windows: DesktopWindow[];
};

export class SessionManager {
  private readonly sessions = new Map<string, DesktopSession>();
  private readonly sessionsByTarget = new Map<string, string>();
  private readonly reservedTargets = new Set<string>();

  async create(target: DesktopTarget, hostInfo: DesktopHostInfo, clickMode: DesktopClickMode, launchMode: 'attach' | 'launch') {
    if (this.sessionsByTarget.has(target.id) || this.reservedTargets.has(target.id)) {
      throw new WebDriverError('session not created', `Target "${target.id}" already has an active session.`);
    }

    this.reservedTargets.add(target.id);
    let lease: ApplicationLease | undefined;
    let releaseReservation = true;
    const leasePromise = launchMode === 'attach' ? target.host.attach(target) : target.host.launch(target);
    try {
      lease = await withCommandTimeout(
        () => leasePromise,
        120_000,
        `${launchMode === 'attach' ? 'Attaching to' : 'Launching'} target "${target.id}"`,
      );
      const windows = await withCommandTimeout(() => target.host.windows(lease!), 10_000, `Reading windows for target "${target.id}"`);
      if (windows.length === 0) {
        throw new WebDriverError('session not created', `Target "${target.id}" did not expose any windows.`);
      }
      const session: DesktopSession = {
        clickMode,
        currentWindowId: windows[0].id,
        desktopTimeouts: {
          appLaunch: 120_000,
          nativeCommand: 10_000,
          stableLayout: 1_000,
          storyRender: 30_000,
        },
        elements: new Map(),
        elementIdsByNativeId: new Map(),
        hostInfo,
        id: randomUUID(),
        inputState: createInputState(),
        lease,
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
      await withCommandTimeout(() => target.host.releaseActions(), 10_000, `Releasing input for target "${target.id}"`).catch(
        () => undefined,
      );
      if (lease) {
        const failedLease = lease;
        await withCommandTimeout(() => target.host.closeApplication(failedLease), 10_000, `Closing failed target "${target.id}"`).catch(
          () => undefined,
        );
      } else {
        releaseReservation = false;
        void leasePromise
          .then(async (lateLease) => {
            await withCommandTimeout(() => target.host.releaseActions(), 10_000, `Releasing late input for target "${target.id}"`).catch(
              () => undefined,
            );
            await withCommandTimeout(() => target.host.closeApplication(lateLease), 10_000, `Closing late target "${target.id}"`).catch(
              () => undefined,
            );
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

  get(id: string): DesktopSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new WebDriverError('invalid session id', `Session "${id}" does not exist.`);
    }
    return session;
  }

  async delete(id: string): Promise<void> {
    const session = this.get(id);
    this.sessions.delete(id);
    this.sessionsByTarget.delete(session.target.id);
    const failures: unknown[] = [];
    try {
      await withCommandTimeout(
        () => session.target.host.releaseActions(),
        session.desktopTimeouts.nativeCommand,
        `Releasing input for session "${id}"`,
      );
    } catch (error) {
      failures.push(error);
    }
    try {
      await withCommandTimeout(
        () => session.target.host.closeApplication(session.lease),
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
  }

  async deleteAll(): Promise<void> {
    const failures: unknown[] = [];
    for (const id of Array.from(this.sessions.keys())) {
      try {
        await this.delete(id);
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, 'One or more desktop sessions failed to close.');
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
    return record;
  }

  resolveElement(session: DesktopSession, id: string): ElementRecord {
    const element = session.elements.get(id);
    if (!element || (element.scope === 'preview' && element.previewGeneration !== session.previewGeneration)) {
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

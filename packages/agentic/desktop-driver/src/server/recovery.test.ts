import type { PrivateStorage } from '../authority/privateStorage.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { createDesktopDriverServer } from './createDesktopDriverServer.js';
import { SessionManager } from './SessionManager.js';
import { SettlementJournal } from './settlementJournal.js';
import type { ApplicationState } from './settlementJournal.js';

/** In-memory private storage with the same never-overwrite and exact-removal rules, and scriptable failures. */
class MemoryStorage implements PrivateStorage {
  readonly records = new Map<string, string>();
  failPublish = false;
  failRemove = false;
  /** Creates the record and then fails, as storage can when it loses its answer. */
  failPublishAfterCreate = false;
  /** Removes the record and then fails. */
  failRemoveAfterDelete = false;
  /** Loses every record right after it is published, as an operator cleanup would. */
  dropAfterPublish = false;
  failRead = false;
  private writeGate?: () => Promise<void>;

  blockWrites() {
    const entered = Promise.withResolvers<void>();
    const released = Promise.withResolvers<void>();
    this.writeGate = () => {
      entered.resolve();
      return released.promise;
    };
    return {
      entered: entered.promise,
      release: () => {
        this.writeGate = undefined;
        released.resolve();
      },
    };
  }

  async read(name: string): Promise<string | undefined> {
    if (this.failRead) {
      throw new Error('Storage is unavailable.');
    }
    return this.records.get(name);
  }

  async publish(name: string, contents: string): Promise<void> {
    await this.writeGate?.();
    if (this.failPublish) {
      throw new Error('Storage is unavailable.');
    }
    if (this.records.has(name)) {
      throw new Error('The record already exists.');
    }
    this.records.set(name, contents);
    if (this.failPublishAfterCreate) {
      throw new Error('Storage lost its answer.');
    }
    if (this.dropAfterPublish) {
      this.records.delete(name);
    }
  }

  async remove(name: string, expectedContents: string): Promise<boolean> {
    await this.writeGate?.();
    if (this.failRemove) {
      throw new Error('Storage is unavailable.');
    }
    if (this.records.get(name) !== expectedContents) {
      return false;
    }
    this.records.delete(name);
    if (this.failRemoveAfterDelete) {
      throw new Error('Storage lost its answer.');
    }
    return true;
  }

  copy(): MemoryStorage {
    const copy = new MemoryStorage();
    for (const [name, contents] of this.records) {
      copy.records.set(name, contents);
    }
    return copy;
  }
}

type Service = {
  harness: DesktopDriverTestHarness;
  open(): Promise<ReturnType<ReturnType<typeof createDesktopDriverClient>['newSession']> extends Promise<infer T> ? T : never>;
};

async function startService(
  storage: MemoryStorage,
  hostOptions: FakeDesktopHostOptions = {},
  probe?: () => Promise<ApplicationState>,
  launchMode: 'attach' | 'launch' = 'attach',
): Promise<Service> {
  const harness = await createDesktopDriverTestHarness(hostOptions, undefined, {
    recovery: { storage, ...(probe ? { probeApplication: probe } : {}) },
  });
  const close = harness.close;
  harness.close = async () => {
    try {
      await close();
    } catch (error) {
      throw new Error(`Settlement fixture cleanup failed:\n${cleanupDetails(error)}`, { cause: error });
    }
  };
  services.push(harness);
  const client = createDesktopDriverClient({ url: harness.server.url });
  return {
    harness,
    open: () =>
      client.newSession({
        alwaysMatch: {
          'furn:clickMode': 'accessibility',
          'furn:launchMode': launchMode,
          'furn:target': harness.target.id,
          platformName: 'windows',
        },
      }),
  };
}

const services: DesktopDriverTestHarness[] = [];

afterEach(async () => {
  const results = await Promise.allSettled(services.splice(0).map((harness) => harness.close()));
  const failed = results.flatMap((result) => (result.status === 'rejected' ? [cleanupDetails(result.reason)] : []));
  if (failed.length) throw new Error(failed.join('\n'));
});

function cleanupDetails(error: unknown): string {
  if (error instanceof AggregateError) return [error.message, ...error.errors.map(cleanupDetails)].join('\n');
  if (error instanceof Error) return error.message;
  return String(error);
}

async function withShortCommandDeadline<T>(service: Service, sessionId: string, command: () => Promise<T>): Promise<T> {
  const timeouts = service.harness.server.sessions.get(sessionId).desktopTimeouts;
  const normalBudget = timeouts.nativeCommand;
  timeouts.nativeCommand = 10;
  try {
    return await command();
  } finally {
    timeouts.nativeCommand = normalBudget;
  }
}

/** Leaves the service's target quarantined by a click that applied but never answered. */
async function quarantineByLostClick(service: Service): Promise<void> {
  const session = await service.open();
  const element = await session.findElement('accessibility id', 'button-primary');
  service.harness.host.injectFault('click', { mode: 'lost-response' });
  await expect(withShortCommandDeadline(service, session.id, () => element.click())).rejects.toMatchObject({
    data: { mutation: { quarantined: true } },
  });
}

const quarantinedOnOpen = { code: 'session not created', data: { reason: 'target-quarantined' } };

describe('Desktop Driver settlement journal', () => {
  test('keeps a target quarantined across a restart until the operator recovers that exact quarantine', async () => {
    const storage = new MemoryStorage();
    await quarantineByLostClick(await startService(storage));
    await services[0].close();

    const restarted = await startService(storage, {}, async () => 'running');
    await expect(restarted.open()).rejects.toMatchObject(quarantinedOnOpen);
    const record = restarted.harness.server.sessions.getQuarantine(restarted.harness.target.id)!;
    expect(record).toMatchObject({
      application: { ownership: 'attached', processId: 1000 },
      effect: 'unknown',
      origin: 'command',
    });

    await expect(
      restarted.harness.server.recoverTarget(restarted.harness.target.id, { evidence: 'application-exited', quarantineId: record.id }),
    ).rejects.toThrow(/not proven/);
    await expect(
      restarted.harness.server.recoverTarget(restarted.harness.target.id, { evidence: 'operator', quarantineId: 'another' }),
    ).rejects.toThrow(/no quarantine with that id/);
    await expect(
      restarted.harness.server.recoverTarget(restarted.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
    ).resolves.toMatchObject({ evidence: 'operator', quarantine: { id: record.id } });
    expect(storage.records.size).toBe(0);
    await expect(restarted.open()).resolves.toBeDefined();
  });

  test('quarantines a target whose mutation was in flight when the service stopped', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');
    const { host, server } = service.harness;
    const dispatch = host.click.bind(host);
    const started = Promise.withResolvers<void>();
    host.injectFault('click', { mode: 'hang' });
    jest.spyOn(host, 'click').mockImplementationOnce((...args) => {
      started.resolve();
      return dispatch(...args);
    });
    const clicking = expect(element.click()).rejects.toMatchObject({ data: { mutation: { quarantined: true } } });
    let leftBehind: MemoryStorage;
    try {
      await Promise.race([
        started.promise,
        clicking.then(() => {
          throw new Error('Click settled before dispatch.');
        }),
      ]);
      // Copy the records at dispatch, before the simulated service stop can settle the mutation.
      leftBehind = storage.copy();
    } finally {
      server.sessions.get(session.id).commandAbortController.abort();
      await clicking;
    }

    const restarted = await startService(leftBehind);
    await expect(restarted.open()).rejects.toMatchObject({
      ...quarantinedOnOpen,
      data: { quarantine: { command: expect.any(String), effect: 'unknown', origin: 'interrupted' } },
    });
  });

  test('lifts a quarantine on its own once the exact application incarnation has exited', async () => {
    const storage = new MemoryStorage();
    await quarantineByLostClick(await startService(storage));
    await services[0].close();

    const probe = jest.fn(async (): Promise<ApplicationState> => 'unknown');
    const restarted = await startService(storage, {}, probe);
    await expect(restarted.open()).rejects.toMatchObject(quarantinedOnOpen);
    expect(probe).toHaveBeenCalledWith({ processId: 1000, processStartedAt: new Date(0).toISOString() });

    probe.mockResolvedValue('exited');
    await expect(restarted.open()).resolves.toBeDefined();
    expect(storage.records.size).toBe(0);
  });

  test('leaves a record it cannot read for the operator, whatever the probe says', async () => {
    const storage = new MemoryStorage();
    await quarantineByLostClick(await startService(storage));
    await services[0].close();
    for (const name of storage.records.keys()) {
      storage.records.set(name, '{"version":2}');
    }

    const restarted = await startService(storage, {}, async () => 'exited');
    await expect(restarted.open()).rejects.toMatchObject({ data: { quarantine: { origin: 'interrupted' } } });
    const record = restarted.harness.server.sessions.getQuarantine(restarted.harness.target.id)!;
    expect(record.application).toBeUndefined();
    await expect(
      restarted.harness.server.recoverTarget(restarted.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
    ).resolves.toBeDefined();
    await expect(restarted.open()).resolves.toBeDefined();
  });

  test('never dispatches a mutation it cannot record first', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');
    storage.failPublish = true;

    await expect(element.click()).rejects.toMatchObject({
      data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: false }, reason: 'journal-unavailable' },
    });
    expect(service.harness.host.actions.some(({ type }) => type === 'click')).toBe(false);

    storage.failPublish = false;
    await expect(element.click()).resolves.toBeNull();
    expect(storage.records.size).toBe(0);
  });

  test.each(['mutation', 'quarantine'])('a valid sibling cannot hide a corrupt %s record from recovery', async (kind) => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    await quarantineByLostClick(service);
    await service.harness.close();
    // Lost-response quarantine normally retains only the quarantine record. Add its mutation sibling to exercise both.
    const [quarantineName, contents] = [...storage.records.entries()].find(([name]) => name.startsWith('quarantine-'))!;
    const record = JSON.parse(contents) as Record<string, unknown>;
    const mutationName = quarantineName.replace('quarantine-', 'mutation-');
    storage.records.set(
      mutationName,
      JSON.stringify({
        application: record.application,
        command: record.command,
        id: record.id,
        kind: 'mutation',
        sessionId: record.sessionId,
        since: record.since,
        targetId: record.targetId,
        version: 1,
      }),
    );
    storage.records.set(kind === 'mutation' ? mutationName : quarantineName, '{"corrupt":true}');
    const probe = jest.fn(async (): Promise<ApplicationState> => 'exited');
    const restarted = await startService(storage, {}, probe);
    await expect(restarted.open()).rejects.toMatchObject(quarantinedOnOpen);
    const quarantine = restarted.harness.server.sessions.getQuarantine(restarted.harness.target.id)!;
    expect(quarantine.application).toBeUndefined();
    await expect(
      restarted.harness.server.recoverTarget(restarted.harness.target.id, {
        evidence: 'application-exited',
        quarantineId: quarantine.id,
      }),
    ).rejects.toThrow(/not proven/);
    expect(probe).not.toHaveBeenCalled();
    expect(storage.records.size).toBe(2);
  });

  test('quarantines the target when it cannot record that a mutation settled', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');
    storage.failRemove = true;

    await expect(element.click()).resolves.toBeNull();
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toMatchObject({
      effect: 'applied',
      origin: 'journal',
    });
    await expect(element.click()).rejects.toMatchObject({ data: { reason: 'target-quarantined' } });
  });

  test('refuses to recover a target while a mutation of it is in flight', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    await quarantineByLostClick(service);
    const record = service.harness.server.sessions.getQuarantine(service.harness.target.id)!;
    const sessions = service.harness.server.sessions;
    const release = new AbortController();
    const { host } = service.harness;
    const started = Promise.withResolvers<void>();
    host.injectFault('releaseActions', { mode: 'hang' });
    const releasing = sessions
      .runMutation(
        sessions.get(record.sessionId!),
        'Releasing input',
        () => {
          started.resolve();
          return host.releaseActions(release.signal);
        },
        { recovery: true },
      )
      .catch(() => undefined);
    try {
      await Promise.race([
        started.promise,
        releasing.then(() => {
          throw new Error('Release settled before dispatch.');
        }),
      ]);
      await expect(
        service.harness.server.recoverTarget(service.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
      ).rejects.toThrow(/mutation in flight/);
    } finally {
      release.abort();
      await releasing;
    }
    await expect(
      service.harness.server.recoverTarget(service.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
    ).resolves.toBeDefined();
  });

  test('never interleaves recovery with a mutation that is being recorded', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    await quarantineByLostClick(service);
    const { sessions } = service.harness.server;
    const targetId = service.harness.target.id;
    const record = sessions.getQuarantine(targetId)!;
    const session = sessions.get(record.sessionId!);
    const release = () => sessions.runMutation(session, 'Releasing input', async () => undefined, { recovery: true });
    const recordingGate = storage.blockWrites();
    const recording = release();
    try {
      await Promise.race([
        recordingGate.entered,
        recording.then(() => {
          throw new Error('Mutation settled before recording.');
        }),
      ]);
      await expect(service.harness.server.recoverTarget(targetId, { evidence: 'operator', quarantineId: record.id })).rejects.toThrow(
        /mutation in flight/,
      );
    } finally {
      recordingGate.release();
      await recording;
    }

    const recoveryGate = storage.blockWrites();
    const recovering = service.harness.server.recoverTarget(targetId, { evidence: 'operator', quarantineId: record.id });
    try {
      await Promise.race([
        recoveryGate.entered,
        recovering.then(() => {
          throw new Error('Recovery settled before writing.');
        }),
      ]);
      await expect(release()).rejects.toMatchObject({ data: { reason: 'target-quarantined' } });
    } finally {
      recoveryGate.release();
      await expect(recovering).resolves.toBeDefined();
    }
    expect(storage.records.size).toBe(0);

    await expect(release()).resolves.toBeUndefined();
    expect(storage.records.size).toBe(0);
  });

  test('clears the records when a launched application is closed and the probe proves it exited', async () => {
    const storage = new MemoryStorage();
    const probe = jest.fn(async (): Promise<ApplicationState> => 'exited');
    const service = await startService(storage, {}, probe, 'launch');
    await quarantineByLostClick(service);
    expect(storage.records.size).toBeGreaterThan(0);

    await service.harness.server.sessions.deleteAll();
    expect(probe).toHaveBeenCalledWith({ processId: expect.any(Number), processStartedAt: expect.any(String) });
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeUndefined();
    expect(storage.records.size).toBe(0);
  });

  test.each([
    ['still running', async (): Promise<ApplicationState> => 'running'],
    ['unknown', async (): Promise<ApplicationState> => 'unknown'],
    ['failing', async (): Promise<ApplicationState> => Promise.reject(new Error('The probe failed.'))],
  ])('keeps the records of a launched application whose exit the %s probe does not prove', async (_name, answer) => {
    const storage = new MemoryStorage();
    let state = answer;
    const service = await startService(storage, {}, () => state(), 'launch');
    await quarantineByLostClick(service);

    await service.harness.server.sessions.deleteAll();
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeDefined();
    expect(storage.records.size).toBeGreaterThan(0);
    await expect(service.open()).rejects.toMatchObject(quarantinedOnOpen);

    // Opening the target again lifts the quarantine once the probe does prove the exit.
    state = async () => 'exited';
    await expect(service.open()).resolves.toBeDefined();
    expect(storage.records.size).toBe(0);
  });

  test('keeps the records of a launched application without a probe, for the operator to lift', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage, {}, undefined, 'launch');
    await quarantineByLostClick(service);

    await service.harness.server.sessions.deleteAll();
    const record = service.harness.server.sessions.getQuarantine(service.harness.target.id)!;
    expect(record).toBeDefined();
    await expect(
      service.harness.server.recoverTarget(service.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
    ).resolves.toBeDefined();
    expect(storage.records.size).toBe(0);
  });

  test('does not wait on a probe that never answers', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    await quarantineByLostClick(service);
    await service.harness.close();
    const sessions = new SessionManager({
      journal: new SettlementJournal(storage),
      probeApplication: () => new Promise<ApplicationState>(() => undefined),
      probeDeadlineMs: 20,
    });
    await sessions.loadTarget(service.harness.target.id);
    const quarantine = sessions.getQuarantine(service.harness.target.id)!;

    await expect(
      sessions.recoverTarget(service.harness.target.id, { evidence: 'application-exited', quarantineId: quarantine.id }),
    ).rejects.toThrow(/not proven to have exited \(unknown\)/);
  });

  test('releases held input and closes the session when the journal cannot record the release', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    await session.performActions([{ id: 'key', type: 'key', actions: [{ type: 'keyDown', value: 'A' }] }]);
    storage.failPublish = true;
    const releases = () => service.harness.host.actions.filter(({ type }) => type === 'release-actions').length;
    const before = releases();

    await expect(session.delete()).resolves.toBeNull();

    expect(releases()).toBe(before + 1);
    expect(service.harness.host.actions).toContainEqual(expect.objectContaining({ type: 'close-application' }));
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeUndefined();
    storage.failPublish = false;
    await expect(service.open()).resolves.toBeDefined();
  });

  test('quarantines the target in memory when an unrecorded release does not settle', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    storage.failPublish = true;
    service.harness.host.injectFault('releaseActions', { mode: 'lost-response' });
    await expect(withShortCommandDeadline(service, session.id, () => session.delete())).rejects.toMatchObject({ code: 'timeout' });

    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toMatchObject({
      effect: 'unknown',
      origin: 'command',
    });
    expect(storage.records.size).toBe(0);
  });

  test('keeps the application open when the release of a closing session never ran', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');
    service.harness.host.injectFault('click', { mode: 'lost-response' });
    const { sessions } = service.harness.server;
    await expect(withShortCommandDeadline(service, session.id, () => element.click())).rejects.toMatchObject({
      data: { mutation: { quarantined: true } },
    });
    const targetId = service.harness.target.id;
    const record = sessions.getQuarantine(targetId)!;
    const gate = storage.blockWrites();
    const recovering = service.harness.server.recoverTarget(targetId, { evidence: 'operator', quarantineId: record.id });
    try {
      await Promise.race([
        gate.entered,
        recovering.then(() => {
          throw new Error('Recovery settled before writing.');
        }),
      ]);
      await expect(session.delete()).rejects.toMatchObject({ data: { reason: 'target-quarantined' } });
      expect(service.harness.host.actions.some(({ type }) => type === 'close-application')).toBe(false);
    } finally {
      gate.release();
      await recovering;
    }
    await sessions.deleteAll();
    expect(service.harness.host.actions).toContainEqual(expect.objectContaining({ type: 'close-application' }));
  });

  test('adopts a record that storage created before it failed, and removes it when the mutation settles', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');
    storage.failPublishAfterCreate = true;

    await expect(element.click()).resolves.toBeNull();
    expect(service.harness.host.actions.some(({ type }) => type === 'click')).toBe(true);
    expect(storage.records.size).toBe(0);
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeUndefined();
  });

  test('treats a record that is already absent as settled, and a failure that removed it as success', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage);
    const session = await service.open();
    const element = await session.findElement('accessibility id', 'button-primary');

    storage.dropAfterPublish = true;
    await expect(element.click()).resolves.toBeNull();
    storage.dropAfterPublish = false;
    storage.failRemoveAfterDelete = true;
    await expect(element.click()).resolves.toBeNull();

    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeUndefined();
    expect(storage.records.size).toBe(0);
  });

  test('bounds every storage call, so storage that never answers cannot hold the service', async () => {
    const hang = new Promise<never>(() => undefined);
    const storage: PrivateStorage = { publish: () => hang, read: () => hang, remove: () => hang };
    const journal = new SettlementJournal(storage, { storageDeadlineMs: 20 });
    const pending = { command: 'Clicking', sessionId: 'session', targetId: 'target' };

    jest.useFakeTimers();
    try {
      const loading = expect(journal.load('target')).rejects.toMatchObject({ code: 'timeout' });
      await jest.advanceTimersByTimeAsync(20);
      await loading;
      const beginning = expect(journal.beginMutation(pending)).rejects.toMatchObject({ code: 'timeout' });
      // Publication times out, then read-back has its own deadline.
      await jest.runAllTimersAsync();
      await beginning;
    } finally {
      jest.useRealTimers();
    }
    expect(journal.hasMutation('target')).toBe(false);
  });

  test('refuses to dispatch when the stored record is not the one it wrote', async () => {
    const storage = new MemoryStorage();
    const journal = new SettlementJournal(storage);
    const pending = { command: 'Clicking', sessionId: 'session', targetId: 'target' };
    await journal.beginMutation(pending);
    const [[name]] = [...storage.records.entries()];
    const other = new SettlementJournal(storage);

    await expect(other.beginMutation(pending)).rejects.toThrow('The record already exists.');
    expect(other.hasMutation('target')).toBe(false);
    expect(storage.records.has(name)).toBe(true);
  });

  test('reads the journal of a target registered after startup before reporting or opening it', async () => {
    const storage = new MemoryStorage();
    await quarantineByLostClick(await startService(storage));
    await services[0].close();

    const late = await createDesktopDriverServer({ recovery: { storage } });
    try {
      storage.failRead = true;
      late.targets.register({
        endpoint: 'windows',
        host: new FakeDesktopHost(),
        id: 'fake-windows',
        platformName: 'windows',
        renderer: 'fabric',
      });
      const client = createDesktopDriverClient({ url: late.url });
      await expect(client.status()).rejects.toMatchObject({ code: 'unknown error', message: /journal.*could not be read/ });
      await expect(client.newSession({ alwaysMatch: { 'furn:target': 'fake-windows' } })).rejects.toMatchObject({
        code: 'session not created',
      });

      storage.failRead = false;
      await expect(client.status()).resolves.toMatchObject({ targets: [{ id: 'fake-windows', quarantine: { origin: 'command' } }] });
      await expect(client.newSession({ alwaysMatch: { 'furn:target': 'fake-windows' } })).rejects.toMatchObject(quarantinedOnOpen);
    } finally {
      await late.close();
    }
  });

  test('redacts the application identity with the session id', () => {
    const record = {
      application: { ownership: 'attached' as const, processId: 7, processStartedAt: 'start' },
      command: 'Clicking',
      effect: 'unknown' as const,
      id: 'quarantine',
      message: 'lost',
      origin: 'command' as const,
      sessionId: 'session',
      since: 'since',
      targetId: 'target',
    };
    const visible = new SessionManager({ redactSessionIds: true }).describeQuarantine(record);
    expect(visible).not.toHaveProperty('application');
    expect(visible).not.toHaveProperty('sessionId');
    expect(new SessionManager().describeQuarantine(record)).toEqual(record);
  });
});

import type { PrivateStorage } from '../authority/privateStorage.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { SessionManager } from './SessionManager.js';
import type { ApplicationState } from './settlementJournal.js';

/** In-memory private storage with the same never-overwrite and exact-removal rules, and scriptable failures. */
class MemoryStorage implements PrivateStorage {
  readonly records = new Map<string, string>();
  failPublish = false;
  failRemove = false;
  /** Holds every storage write until it resolves. */
  gate: Promise<void> | undefined;

  async read(name: string): Promise<string | undefined> {
    return this.records.get(name);
  }

  async publish(name: string, contents: string): Promise<void> {
    await this.gate;
    if (this.failPublish) {
      throw new Error('Storage is unavailable.');
    }
    if (this.records.has(name)) {
      throw new Error('The record already exists.');
    }
    this.records.set(name, contents);
  }

  async remove(name: string, expectedContents: string): Promise<boolean> {
    await this.gate;
    if (this.failRemove) {
      throw new Error('Storage is unavailable.');
    }
    if (this.records.get(name) !== expectedContents) {
      return false;
    }
    this.records.delete(name);
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
  await Promise.all(services.splice(0).map((harness) => harness.close().catch(() => undefined)));
});

/** Leaves the service's target quarantined by a click that applied but never answered. */
async function quarantineByLostClick(service: Service): Promise<void> {
  const session = await service.open();
  const element = await session.findElement('accessibility id', 'button-primary');
  service.harness.host.injectFault('click', { mode: 'lost-response' });
  service.harness.server.sessions.get(session.id).desktopTimeouts.nativeCommand = 10;
  await expect(element.click()).rejects.toMatchObject({ data: { mutation: { quarantined: true } } });
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
    service.harness.host.injectFault('click', { mode: 'hang' });
    const clicking = element.click().catch(() => undefined);
    await waitUntil(() => service.harness.host.actions.some(({ type }) => type === 'fault'));
    // What storage holds at this moment is what a service that stopped now would leave behind.
    const leftBehind = storage.copy();
    service.harness.server.sessions.get(session.id).commandAbortController.abort();
    await clicking;

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
    service.harness.host.injectFault('releaseActions', { mode: 'hang' });
    const releasing = sessions
      .runMutation(sessions.get(record.sessionId!), 'Releasing input', () => service.harness.host.releaseActions(release.signal), {
        recovery: true,
      })
      .catch(() => undefined);
    await waitUntil(() => service.harness.host.actions.filter(({ type }) => type === 'fault').length === 2);

    await expect(
      service.harness.server.recoverTarget(service.harness.target.id, { evidence: 'operator', quarantineId: record.id }),
    ).rejects.toThrow(/mutation in flight/);
    release.abort();
    await releasing;
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
    let open!: () => void;

    storage.gate = new Promise((resolve) => (open = resolve));
    const recording = release();
    await expect(service.harness.server.recoverTarget(targetId, { evidence: 'operator', quarantineId: record.id })).rejects.toThrow(
      /mutation in flight/,
    );
    open();
    await recording;

    storage.gate = new Promise((resolve) => (open = resolve));
    const recovering = service.harness.server.recoverTarget(targetId, { evidence: 'operator', quarantineId: record.id });
    // Let recovery reach its storage write.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(release()).rejects.toMatchObject({ data: { reason: 'target-quarantined' } });
    open();
    await expect(recovering).resolves.toBeDefined();
    expect(storage.records.size).toBe(0);

    storage.gate = undefined;
    await expect(release()).resolves.toBeUndefined();
    expect(storage.records.size).toBe(0);
  });

  test('clears the records when a launched application is closed', async () => {
    const storage = new MemoryStorage();
    const service = await startService(storage, {}, undefined, 'launch');
    await quarantineByLostClick(service);
    expect(storage.records.size).toBeGreaterThan(0);

    await service.harness.server.sessions.deleteAll();
    expect(service.harness.server.sessions.getQuarantine(service.harness.target.id)).toBeUndefined();
    expect(storage.records.size).toBe(0);
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

async function waitUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Timed out waiting for the test condition.');
}

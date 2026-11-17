import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { DesktopAuthority, publishConnectionDescriptor } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity, PrivateStorage, VerifyDesktopService } from '@fluentui-react-native/desktop-driver/authority';
import { resolveDesktopScopeDomains } from '@fluentui-react-native/desktop-driver/authoring';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import type { DesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';

import { DesktopWorkloadService } from './control.js';
import type { DesktopWorkloadRun } from './control.js';
import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import { createManagedDesktopHostResource } from './managedHost.js';
import { DesktopRunReporter } from './reporting/collector.js';
import {
  connectDesktopSupervisor,
  createDesktopSupervisorConnector,
  defaultSupervisorDescriptor,
  publishDesktopSupervisor,
} from './supervisorConnection.js';
import type { DesktopSupervisorConnection, DesktopSupervisorPublication } from './supervisorConnection.js';
import { connectVerifiedDesktopRunner } from './wdio/runnerConnection.js';

jest.mock('./wdio/run.js', () => ({ runDesktopWdioSuite: jest.fn() }));

class MemoryStorage implements PrivateStorage {
  readonly records = new Map<string, string>();

  async read(name: string): Promise<string | undefined> {
    return this.records.get(name);
  }

  async publish(name: string, contents: string): Promise<void> {
    if (this.records.has(name)) throw new Error('exists');
    this.records.set(name, contents);
  }

  async remove(name: string, contents: string): Promise<boolean> {
    if (this.records.get(name) !== contents) return false;
    this.records.delete(name);
    return true;
  }
}

describe('verified supervisor management connection', () => {
  let root: string;
  let storage: MemoryStorage;
  let driver: DesktopDriverTestHarness;
  let authority: DesktopAuthority;
  let service: DesktopWorkloadService;
  let publication: DesktopSupervisorPublication | undefined;
  let verify: jest.MockedFunction<VerifyDesktopService>;
  let prepareCount: number;
  let runWork: (reporter: DesktopRunReporter, signal: AbortSignal) => Promise<void>;
  let releases: (() => void)[];

  const identity: Omit<DesktopServiceIdentity, 'incarnation'> = {
    platform: 'macos',
    pid: 123,
    startedAt: 'test-process-start',
    executablePath: '/fixture/node',
    interactiveSession: 'test-session',
  };

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-supervisor-connection-'));
    storage = new MemoryStorage();
    authority = new DesktopAuthority();
    driver = await createDesktopDriverTestHarness({ endpoint: 'macos' }, undefined, { authority });
    const issued = authority.issue({ label: 'agent', targets: [driver.target.id] });
    await publishConnectionDescriptor(storage, 'agent-connection.json', {
      version: 1,
      url: driver.server.url,
      grant: issued.token,
      service: { ...identity, incarnation: authority.incarnation },
    });
    prepareCount = 0;
    releases = [];
    runWork = async (reporter) => {
      reporter.emit({
        kind: 'test-result',
        payload: { testId: 'case', title: 'case', status: 'passed', attempt: 0, durationMs: 1 },
      });
    };
    service = new DesktopWorkloadService({
      catalog: [{ id: 'suite', kind: 'wdio', lanes: ['accessible'] }],
      prepare: async ({ bindReporter }) => {
        prepareCount++;
        const reporter = new DesktopRunReporter({
          artifactsRoot: root,
          output: { write: () => true },
          errorOutput: { write: () => true },
          reporterMode: 'json',
          summary: false,
        });
        bindReporter(reporter);
        return {
          runId: reporter.runId,
          root: reporter.root,
          run: (signal) => runWork(reporter, signal),
          finish: async (failure) => {
            if (failure !== undefined && !(failure instanceof Error && failure.name === 'AbortError')) reporter.fail(failure);
            await reporter.finish();
          },
        };
      },
    });
    verify = jest.fn<Promise<boolean>, Parameters<VerifyDesktopService>>(async () => true);
    publication = undefined;
  });

  afterEach(async () => {
    for (const release of releases) release();
    await publication?.close().catch(() => undefined);
    await service.close().catch(() => undefined);
    await driver.close();
    jest.restoreAllMocks();
    fs.rmSync(root, { force: true, recursive: true });
  });

  async function publish(): Promise<DesktopSupervisorPublication> {
    publication = await publishDesktopSupervisor({
      service,
      storage,
      identity,
      verifyService: verify,
      driver: { record: 'agent-connection.json', incarnation: authority.incarnation, targetId: driver.target.id },
    });
    return publication;
  }

  function managedHost(privateStorage: PrivateStorage = storage, url = driver.server.url) {
    const target: ResolvedDesktopTarget = {
      endpoint: 'macos',
      id: driver.target.id,
      registrationId: driver.target.id,
      instanceId: 'instance',
      projectRoot: root,
      configPath: path.join(root, 'desktop.config.mts'),
      host: { kind: 'installed', ownership: 'external' },
    };
    const config: ResolvedDesktopConfig = {
      config: {
        schemaVersion: 1,
        targets: { macos: { host: target.host } },
        suites: { suite: { kind: 'wdio', framework: 'jasmine', specs: ['fixture.test.ts'], agent: { lanes: ['physical'] } } },
      },
      configPath: target.configPath,
      projectRoot: root,
      targets: { macos: target },
      reporting: { artifactsRoot: root },
      testScopes: resolveDesktopScopeDomains(),
    };
    return createManagedDesktopHostResource({
      config,
      target,
      hostLane: 'physical',
      driver: { record: 'agent-connection.json', url: driver.server.url },
      addSecret: () => undefined,
      onFailure: () => undefined,
      openEnvironment: async () => ({
        storage: privateStorage,
        verifyService: verify,
        identity,
        driver: {
          record: 'agent-connection.json',
          digest: createHash('sha256').update(storage.records.get('agent-connection.json')!).digest('hex'),
          incarnation: authority.incarnation,
          targetId: driver.target.id,
          url,
        },
      }),
    });
  }

  function descriptor(): {
    incarnation: string;
    management: { url: string; grant: string; service: { incarnation: string } };
    driver: { record: string; digest: string; incarnation: string; targetId: string };
  } {
    return JSON.parse(storage.records.get(defaultSupervisorDescriptor)!) as ReturnType<typeof descriptor>;
  }

  function hold(): { promise: Promise<void>; release: () => void } {
    let release!: () => void;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    releases.push(release);
    return { promise, release };
  }

  async function settled(connection: DesktopSupervisorConnection, handle: string): Promise<DesktopWorkloadRun> {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const answer = await connection.request({ action: 'status', handle });
      if ('run' in answer && answer.run?.phase === 'settled') return answer.run;
      await new Promise<void>((resolve) => setTimeout(resolve, 2));
    }
    throw new Error('Workload did not settle.');
  }

  test('verifies management and its handshake before the bound driver and rechecks before sending each credential', async () => {
    await publish();
    const events: string[] = [];
    const managementUrl = descriptor().management.url;
    verify.mockImplementation(async (_identity, url) => {
      events.push(url === managementUrl ? 'verify-management' : 'verify-driver');
      return true;
    });
    const fetch = globalThis.fetch;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      events.push(String(input).endsWith('/handshake') ? 'handshake' : String(input).endsWith('/status') ? 'driver-status' : 'connection');
      return fetch(input, init);
    });
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    expect(events.indexOf('verify-management')).toBeLessThan(events.indexOf('handshake'));
    expect(events.indexOf('handshake')).toBeLessThan(events.indexOf('verify-driver'));
    expect(events.indexOf('verify-driver')).toBeLessThan(events.indexOf('driver-status'));
    expect(events.lastIndexOf('verify-management')).toBeLessThan(events.indexOf('connection'));
    expect(connection.targetId).toBe(driver.target.id);
    expect(JSON.stringify(connection)).not.toContain(descriptor().management.grant);
    spy.mockRestore();
    await connection.close();
  });

  test('registers the bound driver grant with report redactors before its first authenticated status', async () => {
    const addSecret = jest.spyOn(service, 'addSecret');
    const fetch = jest.spyOn(globalThis, 'fetch');
    await publish();
    const grant = (JSON.parse(storage.records.get('agent-connection.json')!) as { grant: string }).grant;
    const status = fetch.mock.calls.findIndex(([url]) => String(url).startsWith(driver.server.url) && String(url).endsWith('/status'));
    const registration = addSecret.mock.calls.findIndex(([secret]) => secret === grant);
    expect(registration).toBeGreaterThanOrEqual(0);
    expect(status).toBeGreaterThanOrEqual(0);
    expect(addSecret.mock.invocationCallOrder[registration]).toBeLessThan(fetch.mock.invocationCallOrder[status]);
  });

  test('unverifiable management identity sends no credentials', async () => {
    await publish();
    verify.mockResolvedValue(false);
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(connectDesktopSupervisor({ storage, verifyService: verify })).rejects.toThrow('discovery failed');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('binds a runner descriptor to the verified listener and target before its credential is sent', async () => {
    const binding = { url: driver.server.url, incarnation: authority.incarnation, targetId: driver.target.id };
    const fetch = jest.spyOn(globalThis, 'fetch');
    const addSecret = jest.fn();
    const connection = await connectVerifiedDesktopRunner({
      storage,
      verifyService: verify,
      descriptor: 'agent-connection.json',
      binding,
      addSecret,
    });
    expect(connection.url).toBe(driver.server.url);
    expect(addSecret).toHaveBeenCalledTimes(1);
    expect(addSecret.mock.invocationCallOrder[0]).toBeLessThan(fetch.mock.invocationCallOrder[0]);
    fetch.mockClear();
    verify.mockClear();
    await expect(
      connectVerifiedDesktopRunner({
        storage,
        verifyService: verify,
        descriptor: 'agent-connection.json',
        // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This is a mismatched numeric loopback fixture.
        binding: { ...binding, url: 'http://127.0.0.1:1234' },
      }),
    ).rejects.toThrow('Runner discovery failed');
    expect(verify).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    await expect(
      connectVerifiedDesktopRunner({
        storage,
        verifyService: verify,
        descriptor: 'agent-connection.json',
        expect: { url: binding.url, targetId: binding.targetId },
      }),
    ).resolves.toMatchObject({ url: driver.server.url });
    fetch.mockClear();
    verify.mockClear();
    await expect(
      connectVerifiedDesktopRunner({
        storage,
        verifyService: verify,
        descriptor: 'agent-connection.json',
        // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This is a mismatched numeric loopback fixture.
        expect: { targetId: binding.targetId, url: 'http://127.0.0.1:1234' },
      }),
    ).rejects.toThrow('Runner discovery failed');
    expect(verify).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('a host-owned management resource publishes after its driver and leaves the driver running on withdrawal', async () => {
    const manager = managedHost();
    const controller = new AbortController();
    const plan = manager.resource.prepare({ targetId: driver.target.id, targetInstanceId: 'instance', signal: controller.signal });
    await plan.acquire(controller.signal);
    expect(manager.descriptor).toBe(defaultSupervisorDescriptor);
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    expect(await connection.request({ action: 'catalog' })).toMatchObject({
      catalog: [{ id: 'suite', lanes: [], unavailable: 'runner-unavailable' }],
    });
    await connection.close();
    await plan.dispose();
    expect(storage.records.has(defaultSupervisorDescriptor)).toBe(false);
    const agent = JSON.parse(storage.records.get('agent-connection.json')!) as { url: string; grant: string };
    expect(await createDesktopDriverClient(agent).status()).toMatchObject({ ready: true });
  });

  test('uncertain root publication remains fenced instead of removing an unproven record', async () => {
    const uncertainStorage: PrivateStorage = {
      read: (name) => storage.read(name),
      publish: async (name, contents) => {
        await storage.publish(name, contents);
        if (name === defaultSupervisorDescriptor) throw new Error('Publication acknowledgement lost.');
      },
      remove: (name, contents) => storage.remove(name, contents),
    };
    const manager = managedHost(uncertainStorage);
    const controller = new AbortController();
    const plan = manager.resource.prepare({ targetId: driver.target.id, targetInstanceId: 'instance', signal: controller.signal });
    await expect(plan.acquire(controller.signal)).rejects.toThrow('publication did not settle');
    expect(storage.records.has(defaultSupervisorDescriptor)).toBe(true);
    await expect(plan.dispose()).rejects.toThrow('remains unconfirmed');
    expect(storage.records.has(defaultSupervisorDescriptor)).toBe(true);
  });

  test('failed exact-content withdrawal reports unsettled cleanup', async () => {
    const cannotRemove: PrivateStorage = {
      read: (name) => storage.read(name),
      publish: (name, contents) => storage.publish(name, contents),
      remove: async () => false,
    };
    publication = await publishDesktopSupervisor({
      service,
      storage: cannotRemove,
      identity,
      verifyService: verify,
      driver: { record: 'agent-connection.json', incarnation: authority.incarnation, targetId: driver.target.id },
    });
    await expect(publication.close()).rejects.toThrow('withdrawal is not confirmed');
    expect(storage.records.has(defaultSupervisorDescriptor)).toBe(true);
  });

  test('rechecks management ownership before each request and refuses a changed listener', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    verify.mockResolvedValue(false);
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(connection.request({ action: 'catalog' })).rejects.toMatchObject({ code: 'unavailable' });
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
    verify.mockResolvedValue(true);
    await connection.close();
  });

  test('re-verifies the bound driver on reconnect and refuses a changed driver record', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    expect(await connection.verifyDriver()).toMatchObject({
      incarnation: authority.incarnation,
      principal: expect.any(String),
      client: connection.driver,
    });
    const original = storage.records.get('agent-connection.json')!;
    storage.records.set('agent-connection.json', `${original} `);
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(connection.verifyDriver()).rejects.toMatchObject({ code: 'unavailable' });
    expect(fetch.mock.calls.filter(([url]) => String(url).startsWith(driver.server.url))).toHaveLength(0);
    fetch.mockRestore();
    storage.records.set('agent-connection.json', original);
    await connection.close();
  });

  test('refuses a replacement supervisor before transmitting any credential on driver reconnect', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    const original = storage.records.get(defaultSupervisorDescriptor)!;
    storage.records.set(defaultSupervisorDescriptor, `${original} `);
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(connection.verifyDriver()).rejects.toMatchObject({ code: 'unavailable' });
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
    storage.records.set(defaultSupervisorDescriptor, original);
    await connection.close();
  });

  test.each(['digest', 'incarnation', 'target'] as const)(
    'rejects a tampered driver %s rather than falling back to driver-only mode',
    async (field) => {
      await publish();
      const record = descriptor();
      if (field === 'digest') record.driver.digest = '0'.repeat(64);
      if (field === 'incarnation') record.driver.incarnation = `inc_${'0'.repeat(24)}`;
      if (field === 'target') record.driver.targetId = 'wrong-target';
      storage.records.set(defaultSupervisorDescriptor, JSON.stringify(record));
      const fetch = jest.spyOn(globalThis, 'fetch');
      await expect(connectDesktopSupervisor({ storage, verifyService: verify })).rejects.toThrow('discovery failed');
      const driverCalls = fetch.mock.calls.filter(([url]) => String(url).startsWith(driver.server.url));
      expect(driverCalls).toHaveLength(field === 'target' ? 1 : 0);
    },
  );

  test('a stale management incarnation fails its authenticated handshake before the driver is contacted', async () => {
    await publish();
    const record = descriptor();
    record.incarnation = `inc_${'0'.repeat(24)}`;
    record.management.service.incarnation = record.incarnation;
    storage.records.set(defaultSupervisorDescriptor, JSON.stringify(record));
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(connectDesktopSupervisor({ storage, verifyService: verify })).rejects.toThrow('discovery failed');
    expect(fetch.mock.calls.filter(([url]) => String(url).startsWith(driver.server.url))).toHaveLength(0);
  });

  test('detects supervisor replacement during verification and preserves replacement on teardown', async () => {
    await publish();
    const original = storage.records.get(defaultSupervisorDescriptor)!;
    const replacement = `${original} `;
    let rootReads = 0;
    const changing: PrivateStorage = {
      read: async (name) => {
        if (name === defaultSupervisorDescriptor && ++rootReads === 2) {
          storage.records.set(name, replacement);
        }
        return storage.read(name);
      },
      publish: (name, contents) => storage.publish(name, contents),
      remove: (name, contents) => storage.remove(name, contents),
    };
    await expect(connectDesktopSupervisor({ storage: changing, verifyService: verify })).rejects.toThrow('discovery failed');
    await publication!.close();
    expect(storage.records.get(defaultSupervisorDescriptor)).toBe(replacement);
  });

  test('a lost admission response is reconciled by request ID and is never resubmitted', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    const fetch = globalThis.fetch;
    let starts = 0;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/workloads') && init?.body && JSON.parse(String(init.body)).action === 'run') {
        starts++;
        const response = await fetch(input, init);
        await response.text();
        throw new Error('Simulated lost admission response.');
      }
      return fetch(input, init);
    });
    await expect(connection.request({ action: 'run', workload: 'suite', lane: 'accessible', requestId: 'lost' })).rejects.toMatchObject({
      code: 'ambiguous',
    });
    const reconciliation = await connection.request({ action: 'status', requestId: 'lost' });
    if (!('run' in reconciliation) || !reconciliation.run) throw new Error('Expected the accepted run.');
    const result = await settled(connection, reconciliation.run.handle);
    expect(result.outcome).toBe('passed');
    expect(prepareCount).toBe(1);
    expect(starts).toBe(1);
    spy.mockRestore();
    await connection.close();
  });

  test('preserves and verifies selected story IDs across admission and reconciliation', async () => {
    await service.close();
    const prepared: (string | undefined)[] = [];
    service = new DesktopWorkloadService({
      catalog: [{ id: 'stories', kind: 'csf-wdio', lanes: ['accessible'] }],
      prepare: async ({ bindReporter, storyId }) => {
        prepared.push(storyId);
        const reporter = new DesktopRunReporter({
          artifactsRoot: root,
          output: { write: () => true },
          errorOutput: { write: () => true },
          reporterMode: 'json',
          summary: false,
        });
        bindReporter(reporter);
        return {
          runId: reporter.runId,
          root: reporter.root,
          run: (signal) => runWork(reporter, signal),
          finish: async (failure) => {
            if (failure !== undefined) reporter.fail(failure);
            await reporter.finish();
          },
        };
      },
    });
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    const input = {
      action: 'run' as const,
      workload: 'stories',
      lane: 'accessible' as const,
      requestId: 'selected',
      storyId: 'components-button--default',
    };
    const admitted = await connection.request(input);
    if (!('run' in admitted) || !admitted.run) throw new Error('Expected the accepted run.');
    expect(admitted.run.storyId).toBe(input.storyId);
    expect(await connection.request({ action: 'status', requestId: input.requestId })).toMatchObject({
      run: { handle: admitted.run.handle, storyId: input.storyId },
    });
    expect((await settled(connection, admitted.run.handle)).storyId).toBe(input.storyId);

    const fetch = globalThis.fetch;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const response = await fetch(url, init);
      if (String(url).endsWith('/workloads') && init?.body && JSON.parse(String(init.body)).action === 'run') {
        const payload = (await response.json()) as { run: { storyId: string } };
        payload.run.storyId = 'components-other--default';
        return new Response(JSON.stringify(payload), { status: response.status, headers: response.headers });
      }
      return response;
    });
    await expect(connection.request({ ...input, requestId: 'mismatched' })).rejects.toMatchObject({ code: 'ambiguous' });
    spy.mockRestore();
    const recovered = await connection.request({ action: 'status', requestId: 'mismatched' });
    if (!('run' in recovered) || !recovered.run) throw new Error('Expected the accepted run.');
    expect(recovered.run.storyId).toBe(input.storyId);
    expect((await settled(connection, recovered.run.handle)).outcome).toBe('passed');
    expect(prepared).toEqual([input.storyId, input.storyId]);
    await connection.close();
  });

  test('a lost connection-creation response reuses the same connection ID', async () => {
    await publish();
    const fetch = globalThis.fetch;
    const ids: string[] = [];
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connections')) {
        ids.push((JSON.parse(String(init?.body)) as { id: string }).id);
        const response = await fetch(input, init);
        if (ids.length === 1) {
          await response.text();
          throw new Error('Simulated lost connection response.');
        }
        return response;
      }
      return fetch(input, init);
    });
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
    expect(await connection.request({ action: 'catalog' })).toMatchObject({ catalog: [{ id: 'suite' }] });
    spy.mockRestore();
    await connection.close();
  });

  test('reports exhausted redaction capacity over the verified connection', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    for (let index = 0; index < 5000; index++) {
      try {
        service.addSecret(`retired-credential-${index}`);
      } catch {
        break;
      }
    }
    await expect(connection.request({ action: 'status' })).resolves.toMatchObject({ availability: 'capacity' });
    await connection.close();
  });

  test('a recovered ambiguous connection cannot be recreated after its disposed record is evicted', async () => {
    await publish();
    const fetch = globalThis.fetch;
    let id = '';
    let attempts = 0;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connections') && init?.method === 'POST') {
        id = (JSON.parse(String(init.body)) as { id: string }).id;
        const response = await fetch(input, init);
        if (++attempts === 1) {
          await response.text();
          throw new Error('Simulated lost connection response.');
        }
        return response;
      }
      return fetch(input, init);
    });
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    expect(attempts).toBe(2);
    spy.mockRestore();
    let disposals = 0;
    const closeSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connections') && init?.method === 'DELETE') {
        const response = await fetch(input, init);
        if (++disposals === 1) {
          await response.text();
          throw new Error('Simulated lost disposal response.');
        }
        return response;
      }
      return fetch(input, init);
    });
    await expect(connection.close()).rejects.toMatchObject({ code: 'unavailable' });
    await expect(connection.close()).resolves.toBeUndefined();
    expect(disposals).toBe(2);
    closeSpy.mockRestore();

    const { url, grant } = descriptor().management;
    for (let index = 0; index < 128; index++) {
      const nextId = `dmc_${index.toString(16).padStart(32, '0')}`;
      const created = await fetch(`${url}/connections`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${grant}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nextId }),
      });
      expect(created.status).toBe(200);
      const { token } = (await created.json()) as { token: string };
      const disposed = await fetch(`${url}/connection`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      expect(disposed.status).toBe(200);
      await disposed.text();
    }

    const replay = await fetch(`${url}/connections`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${grant}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    expect(replay.status).toBe(401);
    await replay.text();
  }, 15_000);

  test('exhausting abandoned connection IDs fences admission without preventing existing or late cleanup', async () => {
    await publish();
    const { url, grant } = descriptor().management;
    const headers = { Authorization: `Bearer ${grant}`, 'Content-Type': 'application/json' };
    const liveId = `dmc_${'f'.repeat(32)}`;
    const live = await fetch(`${url}/connections`, { method: 'POST', headers, body: JSON.stringify({ id: liveId }) });
    expect(live.status).toBe(200);
    const { token } = (await live.json()) as { token: string };

    for (let index = 0; index < 128; index++) {
      const id = `dmc_${index.toString(16).padStart(32, '0')}`;
      const disposed = await fetch(`${url}/connections`, { method: 'DELETE', headers, body: JSON.stringify({ id }) });
      expect(disposed.status).toBe(200);
      await disposed.text();
    }

    const reconnect = await fetch(`${url}/connections`, { method: 'POST', headers, body: JSON.stringify({ id: liveId }) });
    expect(reconnect.status).toBe(200);
    expect(await reconnect.json()).toEqual({ token });

    const lateId = `dmc_${'e'.repeat(32)}`;
    for (const id of [liveId, lateId]) {
      const disposed = await fetch(`${url}/connections`, { method: 'DELETE', headers, body: JSON.stringify({ id }) });
      expect(disposed.status).toBe(200);
      await disposed.text();
      const replay = await fetch(`${url}/connections`, { method: 'POST', headers, body: JSON.stringify({ id }) });
      expect(replay.ok).toBe(false);
      await replay.text();
    }
  }, 15_000);

  test('retries ambiguous connection creation with the same ID across calls and shares concurrent opens', async () => {
    await publish();
    const fetch = globalThis.fetch;
    const ids: string[] = [];
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connections') && init?.method === 'POST') {
        ids.push((JSON.parse(String(init.body)) as { id: string }).id);
        const response = await fetch(input, init);
        if (ids.length <= 2) {
          await response.text();
          throw new Error('Simulated lost connection response.');
        }
        return response;
      }
      return fetch(input, init);
    });
    const connector = createDesktopSupervisorConnector({ storage, verifyService: verify });
    await expect(connector.connect()).rejects.toMatchObject({ code: 'unavailable' });
    const [first, second] = await Promise.all([connector.connect(), connector.connect()]);
    expect(first).toBe(second);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(1);
    spy.mockRestore();
    await connector.close();
  });

  test('disposes and permanently rejects an acquisition whose responses were lost', async () => {
    await publish();
    const fetch = globalThis.fetch;
    const ids: string[] = [];
    const dispose = jest.spyOn(service, 'dispose');
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connections') && init?.method === 'POST') {
        ids.push((JSON.parse(String(init.body)) as { id: string }).id);
        const response = await fetch(input, init);
        await response.text();
        throw new Error('Simulated lost connection response.');
      }
      return fetch(input, init);
    });
    const connector = createDesktopSupervisorConnector({ storage, verifyService: verify });
    await expect(connector.connect()).rejects.toMatchObject({ code: 'unavailable' });
    await connector.close();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(new Set(ids).size).toBe(1);
    spy.mockRestore();
    const record = descriptor();
    const replay = await fetch(`${record.management.url}/connections`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${record.management.grant}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ids[0] }),
    });
    expect(replay.ok).toBe(false);
    await expect(connector.connect()).rejects.toMatchObject({ code: 'unavailable' });
  });

  test('a lost disposal response can be retried without reopening the principal', async () => {
    await publish();
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    const fetch = globalThis.fetch;
    let deletes = 0;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/connection') && init?.method === 'DELETE') {
        deletes++;
        const response = await fetch(input, init);
        if (deletes === 1) {
          await response.text();
          throw new Error('Simulated lost disposal response.');
        }
        return response;
      }
      return fetch(input, init);
    });
    await expect(connection.close()).rejects.toMatchObject({ code: 'unavailable' });
    await expect(connection.close()).resolves.toBeUndefined();
    await expect(connection.request({ action: 'catalog' })).rejects.toMatchObject({ code: 'unavailable' });
    expect(deletes).toBe(2);
    spy.mockRestore();
  });

  test('connection disposal cancels only its own run and leaves the host serving other principals', async () => {
    await publish();
    const owner = await connectDesktopSupervisor({ storage, verifyService: verify });
    const other = await connectDesktopSupervisor({ storage, verifyService: verify });
    const running = hold();
    const interrupted = hold();
    const release = hold();
    runWork = async (_reporter, signal) => {
      running.release();
      if (!signal.aborted) {
        await new Promise<void>((resolve) =>
          signal.addEventListener(
            'abort',
            () => {
              interrupted.release();
              resolve();
            },
            { once: true },
          ),
        );
      }
      await release.promise;
    };
    const accepted = await owner.request({ action: 'run', workload: 'suite', lane: 'accessible', requestId: 'owned' });
    if (!('run' in accepted) || !accepted.run) throw new Error('Expected an accepted run.');
    await running.promise;
    await expect(other.request({ action: 'cancel', handle: accepted.run.handle })).rejects.toMatchObject({ code: 'unavailable' });
    let disposed = false;
    const disposal = owner.close();
    void disposal.then(
      () => {
        disposed = true;
      },
      () => undefined,
    );
    await interrupted.promise;
    expect(disposed).toBe(false);
    release.release();
    await disposal;
    expect(await other.request({ action: 'status' })).toMatchObject({ availability: 'available' });
    await other.close();
  });

  test('rejects browser origins and invalid model-selected execution fields', async () => {
    await publish();
    const record = descriptor();
    const denied = await fetch(`${record.management.url}/handshake`, {
      headers: { Authorization: `Bearer ${record.management.grant}`, Origin: 'https://example.invalid' },
    });
    expect(denied.status).toBe(401);
    const connection = await connectDesktopSupervisor({ storage, verifyService: verify });
    await expect(
      connection.request({
        action: 'run',
        workload: 'suite',
        lane: 'accessible',
        requestId: 'bad',
        command: 'arbitrary',
      } as never),
    ).rejects.toMatchObject({ code: 'invalid-request' });
    expect(prepareCount).toBe(0);
    await connection.close();
  });
});

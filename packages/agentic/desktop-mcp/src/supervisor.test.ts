import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopAuthority, publishConnectionDescriptor } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity, PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { DesktopWorkloadService } from '@fluentui-react-native/desktop-test/control';
import { DesktopRunReporter } from '@fluentui-react-native/desktop-test/reporting';
import { createDesktopSupervisorConnector, publishDesktopSupervisor } from '@fluentui-react-native/desktop-test/supervisor-connection';
import type { DesktopSupervisorConnector } from '@fluentui-react-native/desktop-test/supervisor-connection';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getEncoding } from 'js-tiktoken';

import { createDesktopMcpServer } from './server.js';

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

function deferred(): { promise: Promise<void>; resolve(): void } {
  let resolve!: () => void;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

async function clientFor(server: McpServer): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientTransport);
  const close = client.close.bind(client);
  client.close = async () => {
    await close();
    await server.close();
  };
  return client;
}

function call(client: Client, args: Record<string, unknown>, name = 'desktop_workload'): Promise<CallToolResult> {
  return client.callTool({ arguments: args, name }) as Promise<CallToolResult>;
}

function json(result: CallToolResult): Record<string, unknown> {
  const block = result.content[0];
  if (block?.type !== 'text') throw new Error('Expected a JSON text block.');
  return JSON.parse(block.text) as Record<string, unknown>;
}

const unavailable: DesktopSupervisorConnector = {
  connect: async () => {
    throw new Error('private-descriptor-secret');
  },
  close: async () => undefined,
};

async function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-mcp-supervisor-'));
  const storage = new MemoryStorage();
  const authority = new DesktopAuthority();
  const driver = await createDesktopDriverTestHarness({ endpoint: 'macos' }, undefined, { authority });
  const identity: Omit<DesktopServiceIdentity, 'incarnation'> = {
    platform: 'macos',
    pid: 123,
    startedAt: 'test-process-start',
    executablePath: '/fixture/node',
    interactiveSession: 'test-session',
  };
  const grant = authority.issue({ label: 'agent', targets: [driver.target.id] });
  await publishConnectionDescriptor(storage, 'agent-connection.json', {
    version: 1,
    url: driver.server.url,
    grant: grant.token,
    service: { ...identity, incarnation: authority.incarnation },
  });
  let executions = 0;
  let runWork: (signal: AbortSignal) => Promise<void> = async () => undefined;
  const service = new DesktopWorkloadService({
    catalog: [{ id: 'suite', kind: 'wdio', lanes: ['accessible'] }],
    prepare: async ({ bindReporter }) => {
      executions++;
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
        run: (signal) => runWork(signal),
        finish: async () => {
          await reporter.finish();
        },
      };
    },
  });
  const verifyService = async () => true;
  const publication = await publishDesktopSupervisor({
    service,
    storage,
    identity,
    verifyService,
    driver: { record: 'agent-connection.json', incarnation: authority.incarnation, targetId: driver.target.id },
  });
  const clients: Client[] = [];
  return {
    driver,
    grant: grant.token,
    storage,
    get executions() {
      return executions;
    },
    setRun(work: (signal: AbortSignal) => Promise<void>) {
      runWork = work;
    },
    async client() {
      const connector = createDesktopSupervisorConnector({ storage, verifyService });
      const client = await clientFor(createDesktopMcpServer({ mode: 'supervisor', connector, version: 'test' }));
      clients.push(client);
      return client;
    },
    async close() {
      await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
      await publication.close();
      await driver.close();
      fs.rmSync(root, { force: true, recursive: true });
    },
  };
}

describe('desktop-mcp supervisor mode', () => {
  test.each([
    ['driver-only', 22_000, 5_200],
    ['supervisor', 24_000, 5_800],
  ] as const)('fixes the %s tool list and bounds discovery bytes and o200k tokens', async (mode, bytes, tokens) => {
    const server =
      mode === 'driver-only'
        ? createDesktopMcpServer({ mode, connect: async () => Promise.reject(new Error('unavailable')), version: 'test' })
        : createDesktopMcpServer({ mode, connector: unavailable, version: 'test' });
    const client = await clientFor(server);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name)).toEqual([
        'desktop_session',
        'desktop_observe',
        'desktop_act',
        'desktop_check',
        'desktop_capture',
        'desktop_story',
        ...(mode === 'supervisor' ? ['desktop_workload'] : []),
      ]);
      const serialized = JSON.stringify(tools);
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThan(bytes);
      expect(getEncoding('o200k_base').encode(serialized).length).toBeLessThan(tokens);
      expect(tools.every((tool) => tool.inputSchema.additionalProperties === false)).toBe(true);
    } finally {
      await client.close();
    }
  });

  test('never falls back to driver discovery or leaks a failed supervisor descriptor', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = await clientFor(createDesktopMcpServer({ mode: 'supervisor', connector: unavailable, version: 'test' }));
    try {
      const workload = await call(client, { action: 'catalog' });
      const driver = await call(client, {}, 'desktop_session');
      expect(json(workload)).toMatchObject({ reason: 'service-unavailable' });
      expect(json(driver)).toMatchObject({ reason: 'service-unavailable' });
      expect(JSON.stringify([workload, driver, errors.mock.calls])).not.toContain('private-descriptor-secret');
      expect((await client.listTools()).tools.some(({ name }) => name === 'desktop_workload')).toBe(true);
    } finally {
      await client.close();
      errors.mockRestore();
    }
  });

  test('reconciles a lost run response without resubmitting and confines credentials', async () => {
    const host = await fixture();
    const client = await host.client();
    const fetch = globalThis.fetch;
    let starts = 0;
    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).endsWith('/workloads') && init?.body && JSON.parse(String(init.body)).action === 'run') {
        starts++;
        const response = await fetch(input, init);
        await response.text();
        throw new Error('simulated response loss');
      }
      return fetch(input, init);
    });
    try {
      const input = { action: 'run', workload: 'suite', lane: 'accessible', requestId: 'lost' };
      const lost = await call(client, input);
      const repeated = await call(client, input);
      expect(json(lost)).toMatchObject({ reason: 'admission-unknown' });
      expect(json(repeated)).toMatchObject({ reason: 'admission-unknown' });
      const status = await call(client, { action: 'status', requestId: 'lost', waitMs: 1000 });
      expect(json(status)).toMatchObject({ run: { requestId: 'lost', workload: 'suite' } });
      expect(starts).toBe(1);
      expect(host.executions).toBe(1);
      const descriptor = JSON.parse(host.storage.records.get('supervisor-connection.json')!) as { management: { grant: string } };
      expect(JSON.stringify([lost, repeated, status])).not.toContain(descriptor.management.grant);
      expect(JSON.stringify([lost, repeated, status])).not.toContain(host.grant);
    } finally {
      spy.mockRestore();
      await host.close();
    }
  });

  test('isolates principals, rejects arbitrary execution inputs, and waits for owned workload drain on disconnect', async () => {
    const host = await fixture();
    const entered = deferred();
    const interrupted = deferred();
    const release = deferred();
    host.setRun(async (signal) => {
      entered.resolve();
      if (!signal.aborted) {
        await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }));
      }
      interrupted.resolve();
      await release.promise;
    });
    const owner = await host.client();
    const other = await host.client();
    try {
      const invalid = await call(owner, { action: 'run', workload: 'suite', lane: 'accessible', requestId: 'bad', command: 'arbitrary' });
      expect(invalid.isError).toBe(true);
      expect(host.executions).toBe(0);
      const accepted = json(await call(owner, { action: 'run', workload: 'suite', lane: 'accessible', requestId: 'owned' }));
      const handle = (accepted.run as { handle: string }).handle;
      await entered.promise;
      expect(json(await call(other, { action: 'status', handle }))).toMatchObject({ reason: 'unavailable' });
      expect(json(await call(other, { action: 'cancel', handle }))).toMatchObject({ reason: 'unavailable' });
      let disposed = false;
      const closing = owner.close().then(() => {
        disposed = true;
      });
      await interrupted.promise;
      expect(disposed).toBe(false);
      release.resolve();
      await closing;
      expect(json(await call(other, { action: 'status' }))).toMatchObject({ availability: 'available' });
    } finally {
      release.resolve();
      await host.close();
    }
  });
});

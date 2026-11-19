import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

import { DesktopAuthority, publishConnectionDescriptor } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity, PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { DesktopWorkloadError, DesktopWorkloadService } from '@fluentui-react-native/desktop-test/control';
import { DesktopRunReporter } from '@fluentui-react-native/desktop-test/reporting';
import { publishDesktopSupervisor } from '@fluentui-react-native/desktop-test/supervisor-connection';
import type { DesktopSupervisorConnector } from '@fluentui-react-native/desktop-test/supervisor-connection';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getEncoding } from 'js-tiktoken';

import { trackSupervisorRestart } from './connection.js';
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
  const publish = (service: DesktopWorkloadService) =>
    publishDesktopSupervisor({
      service,
      storage,
      identity,
      verifyService,
      driver: { record: 'agent-connection.json', incarnation: authority.incarnation, targetId: driver.target.id },
    });
  let publication = await publish(service);
  const clients: Client[] = [];
  return {
    driver,
    grant: grant.token,
    service,
    storage,
    get executions() {
      return executions;
    },
    setRun(work: (signal: AbortSignal) => Promise<void>) {
      runWork = work;
    },
    async client() {
      const connector = trackSupervisorRestart({ storage, verifyService });
      const client = await clientFor(createDesktopMcpServer({ mode: 'supervisor', connector, version: 'test' }));
      clients.push(client);
      return client;
    },
    async restart() {
      await publication.close();
      publication = await publish(
        new DesktopWorkloadService({
          catalog: [],
          prepare: async () => {
            throw new Error('Replacement has no workloads.');
          },
        }),
      );
    },
    async close() {
      await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
      await publication.close();
      await driver.close();
      fs.rmSync(root, { force: true, recursive: true });
    },
  };
}

// Reuse the local supervisor with the real stdio server in an owned Node child. Fixture records travel over IPC.
const stdioFixture = `
  const records = new Map(await new Promise((resolve) => process.once('message', resolve)));
  process.disconnect();
  const { serveDesktopMcpStdio } = await import(process.argv[1]);
  const { createDesktopMcpServer } = await import(process.argv[2]);
  const { createDesktopSupervisorConnector } = await import('@fluentui-react-native/desktop-test/supervisor-connection');
  const storage = { read: async (name) => records.get(name) };
  await serveDesktopMcpStdio(createDesktopMcpServer({
    mode: 'supervisor', connector: createDesktopSupervisorConnector({ storage, verifyService: async () => true }), version: 'test',
  }));
`;

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
      expect(errors).toHaveBeenCalledWith('desktop-mcp: workload connection failed; verify private discovery and the service identity.');
      expect(JSON.stringify([workload, driver, errors.mock.calls])).not.toContain('private-descriptor-secret');
      expect((await client.listTools()).tools.some(({ name }) => name === 'desktop_workload')).toBe(true);
    } finally {
      await client.close();
      errors.mockRestore();
    }
  });

  test('preserves capacity when supervisor principal acquisition is refused', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const connector = { ...unavailable, connect: async () => Promise.reject(new DesktopWorkloadError('capacity')) };
    const client = await clientFor(createDesktopMcpServer({ mode: 'supervisor', connector, version: 'test' }));
    try {
      expect(json(await call(client, { action: 'catalog' }))).toMatchObject({ reason: 'capacity' });
      expect(json(await call(client, {}, 'desktop_session'))).toMatchObject({ reason: 'capacity' });
    } finally {
      await client.close();
      errors.mockRestore();
    }
  });

  test.each(['busy', 'conflict', 'stale-cursor', 'capacity'] as const)('preserves a supervisor workload %s response', async (code) => {
    const host = await fixture();
    const client = await host.client();
    const fetch = globalThis.fetch;
    const spy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation((input, init) =>
        String(input).endsWith('/workloads')
          ? Promise.resolve(Response.json({ error: { code } }, { status: code === 'capacity' ? 429 : 409 }))
          : fetch(input, init),
      );
    try {
      expect(json(await call(client, { action: 'catalog' }))).toMatchObject({ reason: code });
    } finally {
      spy.mockRestore();
      await host.close();
    }
  });

  test.each(['desktop_workload', 'desktop_session'])(
    'reports supervisor replacement first through %s without replaying work',
    async (tool) => {
      const host = await fixture();
      const client = await host.client();
      const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const input = { action: 'run', workload: 'suite', lane: 'accessible', requestId: 'original' };
      try {
        expect((await call(client, input)).isError).not.toBe(true);
        expect(json(await call(client, { action: 'status', requestId: 'original', waitMs: 1000 }))).toHaveProperty('run');
        await host.restart();
        const calls = jest.spyOn(globalThis, 'fetch');
        try {
          expect(json(await call(client, { action: 'status' }, tool))).toMatchObject({ reason: 'supervisor-restarted' });
          expect(json(await call(client, input))).toMatchObject({ reason: 'supervisor-restarted' });
          expect(json(await call(client, { action: 'status', requestId: 'original' }))).toMatchObject({ reason: 'supervisor-restarted' });
          expect(json(await call(client, {}, 'desktop_session'))).toMatchObject({ reason: 'supervisor-restarted' });
          expect(calls).not.toHaveBeenCalled();
          expect(host.executions).toBe(1);
        } finally {
          calls.mockRestore();
        }
      } finally {
        await host.close();
        errors.mockRestore();
      }
    },
  );

  test.each(
    process.platform === 'win32'
      ? (['stdin end', 'failed cleanup'] as const)
      : (['stdin end', 'failed cleanup', 'SIGTERM', 'SIGHUP'] as const),
  )(
    'stdio %s disposes its principal before exiting',
    async (trigger) => {
      const host = await fixture();
      const entered = deferred();
      const release = deferred();
      const dispose = host.service.dispose.bind(host.service);
      const deletion = jest.spyOn(host.service, 'dispose').mockImplementationOnce(async (token) => {
        entered.resolve();
        await release.promise;
        if (trigger === 'failed cleanup') throw new Error('test cleanup failure');
        await dispose(token);
      });
      const lib = path.resolve(__dirname, '../lib');
      const child = spawn(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          stdioFixture,
          pathToFileURL(path.join(lib, 'stdio.js')).href,
          pathToFileURL(path.join(lib, 'server.js')).href,
        ],
        { cwd: path.resolve(__dirname, '..'), stdio: ['pipe', 'pipe', 'pipe', 'ipc'] },
      );
      const closed = once(child, 'close');
      void closed.catch(() => undefined);
      const stdout = createInterface({ input: child.stdout! });
      const stderr: string[] = [];
      child.stderr!.setEncoding('utf8').on('data', (text: string) => stderr.push(text));
      const signal = AbortSignal.timeout(10_000);
      const deadline = once(signal, 'abort').then(() => {
        throw signal.reason;
      });
      void deadline.catch(() => undefined);
      const exchange = async (id: number, method: string, params: object) => {
        const answer = once(stdout, 'line', { signal });
        child.stdin!.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
        const [line] = (await answer) as [string];
        return JSON.parse(line) as { id: number; result: { isError?: boolean } };
      };
      try {
        child.send([...host.storage.records]);
        expect(
          await exchange(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1' } }),
        ).toMatchObject({ id: 1, result: { capabilities: expect.any(Object) } });
        const catalog = await exchange(2, 'tools/call', { name: 'desktop_workload', arguments: { action: 'catalog' } });
        expect(catalog.id).toBe(2);
        expect(catalog.result.isError).not.toBe(true);
        if (trigger === 'SIGTERM' || trigger === 'SIGHUP') child.kill(trigger);
        else child.stdin!.end();
        // The service only disposes this principal after receiving DELETE /connection.
        await Promise.race([
          entered.promise,
          closed.then(() => {
            throw new Error('Adapter exited before principal deletion.');
          }),
          deadline,
        ]);
        expect(child.exitCode).toBeNull();
        release.resolve();
        await expect(Promise.race([closed, deadline])).resolves.toEqual([trigger === 'failed cleanup' ? 1 : 0, null]);
        expect(deletion).toHaveBeenCalledTimes(1);
        expect(stderr.join('').includes('cleanup is incomplete')).toBe(trigger === 'failed cleanup');
      } finally {
        release.resolve();
        if (child.exitCode === null && child.signalCode === null) child.kill();
        await closed.catch(() => undefined);
        stdout.close();
        deletion.mockRestore();
        await host.close();
      }
    },
    15_000,
  );

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

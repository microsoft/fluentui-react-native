import { createHash, randomBytes } from 'node:crypto';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver/storybook';
import {
  createDesktopDriverStoryHarness as createStoryHarness,
  createDesktopDriverTestHarness as createTestHarness,
} from '@fluentui-react-native/desktop-driver/testing';
import type { DesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import type { ConnectDesktopDriver, DesktopDriverConnection } from './connection.js';
import { DesktopController } from './controller.js';
import { createDesktopDriverMcpServer } from './server.js';

type Fixture = { client: Client; harness: DesktopDriverTestHarness };

const features = { accessibilityActions: true, boundedObservation: true };
const onePixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const connections = new WeakMap<DesktopDriverTestHarness, { authority: DesktopAuthority; token: string }>();

async function createDesktopDriverTestHarness(
  options: Parameters<typeof createTestHarness>[0] = {},
  story?: Parameters<typeof createTestHarness>[1],
  serverOptions: Parameters<typeof createTestHarness>[2] = {},
): Promise<DesktopDriverTestHarness> {
  const authority = serverOptions.authority ?? new DesktopAuthority();
  const grant = authority.issue({ label: 'test', targets: '*' });
  const harness = await createTestHarness(options, story, { ...serverOptions, authority });
  connections.set(harness, { authority, token: grant.token });
  return harness;
}

async function createDesktopDriverStoryHarness(
  manifest: DesktopStoryManifest,
  options: Parameters<typeof createStoryHarness>[1],
): Promise<DesktopDriverTestHarness> {
  const authority = new DesktopAuthority();
  const grant = authority.issue({ label: 'test', targets: '*' });
  const harness = await createStoryHarness(manifest, options, { authority });
  connections.set(harness, { authority, token: grant.token });
  return harness;
}

async function connectClient(connect: ConnectDesktopDriver, progressIntervalMs?: number): Promise<Client> {
  const server = createDesktopDriverMcpServer({ connect, version: '0.0.0-test', ...(progressIntervalMs ? { progressIntervalMs } : {}) });
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

async function withFixture(
  options: Parameters<typeof createDesktopDriverTestHarness>[0],
  body: (fixture: Fixture) => Promise<void>,
  progressIntervalMs?: number,
): Promise<void> {
  const harness = await createDesktopDriverTestHarness({ ...options, features: { ...features, ...options?.features } });
  const client = await connectClient(async () => testConnection(harness), progressIntervalMs);
  try {
    await body({ client, harness });
  } finally {
    await call(client, 'desktop_session', { action: 'close' });
    await client.close();
    await harness.close();
  }
}

function testConnection(harness: DesktopDriverTestHarness, fetcher?: typeof fetch): DesktopDriverConnection {
  const connection = connections.get(harness);
  if (!connection) throw new Error('Missing fixture authority.');
  return {
    client: createDesktopDriverClient({ grant: connection.token, url: harness.server.url, ...(fetcher ? { fetch: fetcher } : {}) }),
    incarnation: connection.authority.incarnation,
    principal: connection.token.split('.')[1],
  };
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

function call(client: Client, name: string, args: Record<string, unknown> = {}, options = {}): Promise<CallToolResult> {
  return client.callTool({ arguments: args, name }, undefined, options) as Promise<CallToolResult>;
}

function json(result: CallToolResult, index = 0): Record<string, unknown> {
  const block = result.content[index];
  if (block?.type !== 'text') {
    throw new Error(`Content block ${index} is not text.`);
  }
  return JSON.parse(block.text) as Record<string, unknown>;
}

async function open(client: Client, harness: DesktopDriverTestHarness): Promise<string> {
  const opened = await call(client, 'desktop_session', { action: 'open', launch: true, target: harness.target.id });
  expect(opened.isError).toBeUndefined();
  return json(opened).id as string;
}

describe('desktop-driver-mcp', () => {
  test('relinquish fences admission immediately and waits for terminal deletion before issuing a fresh child', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const controller = new DesktopController(async () => testConnection(harness));
    const entered = deferred();
    const finish = deferred();
    const release = harness.host.releaseActions.bind(harness.host);
    try {
      const session = await controller.open({ launch: true, target: harness.target.id });
      const owner = harness.server.sessions.get(session.id).owner?.grantId;
      jest.spyOn(harness.host, 'releaseActions').mockImplementationOnce(async (signal) => {
        entered.resolve();
        await finish.promise;
        return release(signal);
      });
      let completed = false;
      const handoff = controller.relinquish().then((result) => {
        completed = true;
        return result;
      });
      await entered.promise;
      await expect(controller.status()).rejects.toMatchObject({ reason: 'controller-draining' });
      await expect(controller.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({ reason: 'controller-draining' });
      expect(completed).toBe(false);
      finish.resolve();
      await expect(handoff).resolves.toEqual({ relinquished: true });
      expect(() => harness.server.sessions.get(session.id)).toThrow();
      expect(controller.session).toBeUndefined();
      await expect(controller.readArtifact(session.id, 'a1')).rejects.toMatchObject({ reason: 'artifact-expired' });
      const next = await controller.open({ launch: true, target: harness.target.id });
      expect(harness.server.sessions.get(next.id).owner?.grantId).not.toBe(owner);
    } finally {
      finish.resolve();
      await controller.dispose();
      await harness.close();
    }
  });

  test('relinquish cancels a running operation rather than waiting behind its queue', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const controller = new DesktopController(async () => testConnection(harness));
    const entered = deferred();
    try {
      await controller.open({ launch: true, target: harness.target.id });
      const observe = harness.host.observe.bind(harness.host);
      jest.spyOn(harness.host, 'observe').mockImplementationOnce(async (request, signal) => {
        entered.resolve();
        await new Promise<void>((resolve) => {
          if (signal?.aborted) resolve();
          else signal?.addEventListener('abort', () => resolve(), { once: true });
        });
        signal?.throwIfAborted();
        return observe(request, signal);
      });
      const pending = controller.run('observe', {});
      const cancelled = expect(pending).rejects.toMatchObject({ reason: 'cancelled' });
      await entered.promise;
      await expect(controller.relinquish()).resolves.toEqual({ relinquished: true });
      await cancelled;
      expect(controller.session).toBeUndefined();
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test.each(['lost-response', 'drain-failure'] as const)('failed relinquish retains a retryable drain fence after %s', async (failure) => {
    const harness = await createDesktopDriverTestHarness({ features });
    let injected = false;
    const connection = testConnection(harness, async (input, init) => {
      const response = await fetch(input, init);
      if (!injected && String(input).endsWith('/furn/grants/current') && failure === 'lost-response') {
        injected = true;
        await response.body?.cancel();
        throw new Error('injected response loss');
      }
      return response;
    });
    const controller = new DesktopController(async () => connection);
    try {
      const session = await controller.open({ launch: true, target: harness.target.id });
      if (failure === 'drain-failure')
        jest.spyOn(harness.server.sessions, 'deleteOwnedBy').mockRejectedValueOnce(new Error('injected drain failure'));
      await expect(controller.relinquish()).rejects.toMatchObject({ reason: 'drain-incomplete' });
      await expect(controller.status()).rejects.toMatchObject({ reason: 'controller-draining' });
      await expect(controller.relinquish()).resolves.toEqual({ relinquished: true });
      expect(() => harness.server.sessions.get(session.id)).toThrow();
      await expect(controller.open({ launch: true, target: harness.target.id })).resolves.toBeDefined();
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test('the MCP relinquish action expires session-bound artifacts, references, cursors, and proofs', async () => {
    await withFixture({}, async ({ client, harness }) => {
      const previous = await open(client, harness);
      const observed = json(await call(client, 'desktop_observe', { observe: { budget: { maxNodes: 1 } } })).result as {
        next: string;
        sample: { id: string };
      };
      const found = json(await call(client, 'desktop_observe', { find: { automationId: 'button-primary' } })).result as {
        matches: { ref: string }[];
        sample: { id: string };
      };
      const captured = await call(client, 'desktop_capture');
      const link = captured.content.find((block) => block.type === 'resource_link');
      expect(link).toBeDefined();
      const stale = found.matches[0].ref;
      expect(json(await call(client, 'desktop_session', { action: 'relinquish' }))).toEqual({ relinquished: true });
      await open(client, harness);
      const checked = await call(client, 'desktop_check', { ref: stale, expect: { enabled: true } });
      expect(checked.isError).toBe(true);
      expect(json(checked)).toMatchObject({ reason: expect.stringMatching(/^ref-/) });
      const page = await call(client, 'desktop_observe', { read: { cursor: observed.next } });
      expect(page.isError).toBe(true);
      expect(json(page)).toMatchObject({ reason: 'observation-cursor-expired' });
      const acted = await call(client, 'desktop_act', { steps: [{ act: { action: 'activate', ref: stale, sample: found.sample.id } }] });
      expect(json(acted)).toMatchObject({ result: { status: 'stopped', steps: [{ error: { reason: expect.any(String) } }] } });
      if (link?.type === 'resource_link') await expect(client.readResource({ uri: link.uri })).rejects.toThrow();
      expect(() => harness.server.sessions.get(previous)).toThrow();
    });
  });

  test('isolates controllers sharing a descriptor principal instead of sharing sessions', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const first = new DesktopController(async () => testConnection(harness));
    const second = new DesktopController(async () => testConnection(harness));
    try {
      const session = await first.open({ launch: true, target: harness.target.id });
      const owner = harness.server.sessions.get(session.id).owner?.grantId;
      expect(owner).not.toBe(testConnection(harness).principal);
      expect((await second.status()).session).toBeUndefined();
      await expect(second.run('observe', {})).rejects.toMatchObject({ reason: 'no-session' });
      await expect(second.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({ code: 'session not created' });
      await first.dispose();
      const next = await second.open({ launch: true, target: harness.target.id });
      expect(harness.server.sessions.get(next.id).owner?.grantId).not.toBe(owner);
    } finally {
      await first.dispose();
      await second.dispose();
      await harness.close();
    }
  });

  test('refuses old or unprotected services rather than falling back to shared authority', async () => {
    const harness = await createTestHarness({ features });
    const controller = new DesktopController(async () => ({
      client: createDesktopDriverClient({ url: harness.server.url }),
      incarnation: 'legacy',
      principal: 'legacy',
    }));
    try {
      await expect(controller.status()).rejects.toMatchObject({ reason: 'connection-authority-unsupported' });
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test.each(['lost-response', 'drain-failure', 'unauthorized'] as const)(
    'retains terminal cleanup responsibility after %s',
    async (failure) => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const harness = await createDesktopDriverTestHarness({ features });
      let revocations = 0;
      const connection = testConnection(harness, async (input, init) => {
        const response = await fetch(input, init);
        if (String(input).endsWith('/furn/grants/current')) {
          revocations += 1;
          if (revocations === 1 && failure === 'lost-response') {
            await response.body?.cancel();
            throw new Error('injected revoke response loss');
          }
          if (revocations === 1 && failure === 'unauthorized') {
            await response.body?.cancel();
            return new Response(JSON.stringify({ value: { error: 'unauthorized', message: 'injected auth failure' } }), {
              status: 401,
              headers: { 'content-type': 'application/json' },
            });
          }
        }
        return response;
      });
      const controller = new DesktopController(async () => connection);
      try {
        const session = await controller.open({ launch: true, target: harness.target.id });
        if (failure === 'drain-failure') {
          jest.spyOn(harness.server.sessions, 'deleteOwnedBy').mockRejectedValueOnce(new Error('injected drain failure'));
        }
        await controller.dispose();
        expect(controller.session).toBe(session.id);
        expect(errors).toHaveBeenCalledWith(
          'desktop-driver-mcp: session cleanup is incomplete; the service must drain or expire the session.',
        );
        await controller.dispose();
        expect(controller.session).toBeUndefined();
        expect(revocations).toBe(2);
        expect(() => harness.server.sessions.get(session.id)).toThrow();
      } finally {
        await controller.dispose();
        await harness.close();
        errors.mockRestore();
      }
    },
  );

  test('never echoes discovery failure contents to diagnostics or model output', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const sensitive = 'fdg1.private-principal.private-credential';
    const client = await connectClient(async () => {
      throw new Error(sensitive);
    });
    try {
      const result = await call(client, 'desktop_session');
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result)).not.toContain(sensitive);
      expect(errors).toHaveBeenCalledWith('desktop-driver-mcp: connecting failed; verify private discovery and the service identity.');
      expect(JSON.stringify(errors.mock.calls)).not.toContain(sensitive);
    } finally {
      await client.close();
      errors.mockRestore();
    }
  });

  test('offers six tools with bounded schemas, and lists the service targets', async () => {
    await withFixture({}, async ({ client, harness }) => {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name)).toEqual([
        'desktop_session',
        'desktop_observe',
        'desktop_act',
        'desktop_check',
        'desktop_capture',
        'desktop_story',
      ]);
      // This bounds serialized JavaScript characters, not tokens or UTF-8 bytes.
      expect(JSON.stringify(tools).length).toBeLessThan(22_000);
      const readOnly = Object.fromEntries(tools.map((tool) => [tool.name, tool.annotations?.readOnlyHint]));
      expect(readOnly).toEqual({
        desktop_act: false,
        desktop_capture: true,
        desktop_check: true,
        desktop_observe: true,
        desktop_session: false,
        desktop_story: false,
      });
      expect(tools.every((tool) => tool.inputSchema.additionalProperties === false)).toBe(true);

      expect(json(await call(client, 'desktop_session'))).toEqual({
        targets: [
          { endpoint: 'windows', id: harness.target.id, launchModes: ['launch', 'attach'], platformName: 'windows', renderer: 'fabric' },
        ],
      });
    });
  });

  test('opens one session, observes with the outline as its own block, acts, checks, and closes', async () => {
    await withFixture({}, async ({ client, harness }) => {
      expect(json(await call(client, 'desktop_observe'))).toEqual({
        error: 'adapter',
        message: 'No session is open. Open one with desktop_session first.',
        reason: 'no-session',
      });

      const opened = json(await call(client, 'desktop_session', { action: 'open', launch: true, target: harness.target.id }));
      expect(opened).toMatchObject({ clickMode: expect.any(String), id: expect.any(String), target: harness.target.id });
      expect(opened.operations).toContainEqual({ available: true, name: 'sequence' });
      const again = await call(client, 'desktop_session', { action: 'open', launch: true, target: harness.target.id });
      expect(again.isError).toBe(true);
      expect(json(again)).toMatchObject({ reason: 'session-open' });

      const observed = await call(client, 'desktop_observe');
      expect(json(observed)).toMatchObject({ operation: 'observe', result: { outline: '(text block 2)' } });
      expect(observed.content[1]).toEqual({ text: expect.stringContaining('button "Primary"'), type: 'text' });

      const act = { requestId: 'name-1', steps: [{ act: { action: 'type', find: { automationId: 'input-name' }, text: 'Ada' } }] };
      expect(json(await call(client, 'desktop_act', act))).toMatchObject({
        operation: 'sequence',
        requestId: 'name-1',
        result: { status: 'completed', steps: [{ act: { disposition: 'applied' } }] },
      });
      const typed = harness.host.actions.length;
      // The same request id returns the first outcome instead of typing again.
      expect(json(await call(client, 'desktop_act', act))).toMatchObject({ requestId: 'name-1', result: { status: 'completed' } });
      expect(harness.host.actions).toHaveLength(typed);

      const check = await call(client, 'desktop_check', { expect: { valueContains: 'Ada' }, find: { automationId: 'input-name' } });
      expect(json(check)).toMatchObject({ operation: 'check', result: { status: 'passed' } });

      const found = json(await call(client, 'desktop_observe', { find: { automationId: 'button-primary' } }));
      expect(found).toMatchObject({ operation: 'find', result: { outcome: 'unique' } });
      const journal = json(await call(client, 'desktop_observe', { journal: {} }));
      expect(JSON.stringify(journal)).not.toContain('Ada');

      expect(json(await call(client, 'desktop_session', { action: 'close' }))).toEqual({ closed: opened.id });
      expect(json(await call(client, 'desktop_session'))).not.toHaveProperty('session');
    });
  });

  test('reads observation continuation and delta variants through the typed observe tool', async () => {
    await withFixture({}, async ({ client, harness }) => {
      await open(client, harness);
      const first = json(await call(client, 'desktop_observe', { observe: { budget: { maxNodes: 1 } } })).result as Record<string, unknown>;
      expect(first.next).toEqual(expect.any(String));

      const page = json(await call(client, 'desktop_observe', { read: { cursor: first.next, budget: { maxNodes: 4 } } }));
      expect(page).toMatchObject({
        operation: 'observePage',
        result: { sample: { id: (first.sample as Record<string, unknown>).id } },
      });

      const delta = json(await call(client, 'desktop_observe', { delta: { since: (first.sample as Record<string, unknown>).id } }));
      expect(delta).toMatchObject({
        operation: 'observeDelta',
        result: { mode: 'delta', baseSample: (first.sample as Record<string, unknown>).id },
      });
    });
  });

  test('rejects malformed calls before they reach the service', async () => {
    await withFixture({}, async ({ client, harness }) => {
      await open(client, harness);
      const before = harness.host.actions.length;
      for (const [name, args] of [
        ['desktop_session', { action: 'open' }],
        ['desktop_observe', { find: { automationId: 'a' }, journal: {} }],
        ['desktop_act', { steps: [{ act: { action: 'activate', find: { automationId: 'button-primary' } } }], extra: true }],
        ['desktop_act', { requestId: 'not allowed', steps: [{ act: { action: 'activate', find: { automationId: 'button-primary' } } }] }],
        ['desktop_check', { find: { automationId: 'button-primary' } }],
      ] as const) {
        const result = await call(client, name, args);
        expect({ name, isError: result.isError }).toEqual({ isError: true, name });
      }
      expect(harness.host.actions).toHaveLength(before);
    });
  });

  test('lists stories and renders one, expiring references into the preview it replaced', async () => {
    const manifest: DesktopStoryManifest = {
      endpoint: 'windows',
      entries: [
        { id: 'components-button--default', name: 'Default', packageName: 'pkg', sourcePath: 'a.stories.tsx', tags: [], title: 'Button' },
        {
          id: 'components-checkbox--default',
          name: 'Default',
          packageName: 'pkg',
          sourcePath: 'b.stories.tsx',
          tags: [],
          title: 'Checkbox',
        },
      ],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 1,
    };
    const harness = await createDesktopDriverStoryHarness(manifest, { features });
    // Model a preview container whose native identity survives both selection and reset.
    jest.spyOn(harness.host, 'resetPreview').mockImplementation(() => {});
    const client = await connectClient(async () => testConnection(harness));
    try {
      await open(client, harness);
      expect(json(await call(client, 'desktop_story', { list: { filter: 'checkbox' } }))).toMatchObject({
        operation: 'stories',
        result: { entries: [{ id: 'components-checkbox--default' }], matched: 1, total: 2 },
      });
      const found = json(await call(client, 'desktop_observe', { find: { automationId: 'button-primary' } })) as {
        result: { matches: { ref: string }[] };
      };

      const select = { requestId: 'story-1', story: { storyId: 'components-checkbox--default' } };
      const rendered = json(await call(client, 'desktop_story', select));
      expect(rendered).toMatchObject({
        operation: 'story',
        requestId: 'story-1',
        result: { disposition: 'applied', storyId: 'components-checkbox--default', verification: 'marker' },
      });
      // The same request id returns the first outcome instead of rendering again.
      expect(json(await call(client, 'desktop_story', select))).toEqual(rendered);
      expect(json(await call(client, 'desktop_story'))).toMatchObject({
        result: { current: { storyId: 'components-checkbox--default', verification: 'marker' } },
      });
      expect(json(await call(client, 'desktop_observe', { observe: { within: found.result.matches[0].ref } }))).toMatchObject({
        error: 'stale element reference',
        reason: 'ref-region-changed',
      });
      const current = json(await call(client, 'desktop_observe', { find: { automationId: 'button-primary' } })) as {
        result: { matches: { ref: string }[] };
      };
      expect(json(await call(client, 'desktop_observe', { observe: { within: found.result.matches[0].ref } }))).toMatchObject({
        error: 'stale element reference',
      });
      expect(
        json(
          await call(client, 'desktop_story', {
            requestId: 'reset-1',
            story: { action: 'reset', storyId: 'components-checkbox--default' },
          }),
        ),
      ).toMatchObject({
        operation: 'story',
        result: { disposition: 'applied', verification: 'marker' },
      });
      expect(json(await call(client, 'desktop_observe', { observe: { within: current.result.matches[0].ref } }))).toMatchObject({
        error: 'stale element reference',
        reason: 'ref-region-changed',
      });
      await call(client, 'desktop_observe', { find: { automationId: 'button-primary' } });
      for (const ref of [found.result.matches[0].ref, current.result.matches[0].ref]) {
        expect(json(await call(client, 'desktop_observe', { observe: { within: ref } }))).toMatchObject({
          error: 'stale element reference',
        });
      }
      for (const args of [
        { list: {}, story: { storyId: 'components-button--default' } },
        { list: {}, requestId: 'r' },
      ]) {
        expect((await call(client, 'desktop_story', args)).isError).toBe(true);
      }
    } finally {
      await call(client, 'desktop_session', { action: 'close' });
      await client.close();
      await harness.close();
    }
  });

  test('reports stories as unsupported on a target without Storybook', async () => {
    await withFixture({}, async ({ client, harness }) => {
      await open(client, harness);
      expect(json(await call(client, 'desktop_story'))).toMatchObject({ error: 'unsupported operation', reason: 'stories-unsupported' });
    });
  });

  test('returns an image only when asked, and links the whole capture as a resource of its session', async () => {
    await withFixture({}, async ({ client, harness }) => {
      const session = await open(client, harness);
      const plain = await call(client, 'desktop_capture');
      expect(plain.content.map((block) => block.type)).toEqual(['text', 'resource_link']);
      expect(json(plain)).toMatchObject({ result: { artifact: 'a1', scope: 'window' } });
      expect(JSON.stringify(json(plain))).not.toContain('"image"');

      const shown = await call(client, 'desktop_capture', { image: true });
      expect(shown.content.slice(1)).toEqual([
        { data: onePixelPng, mimeType: 'image/png', type: 'image' },
        { mimeType: 'image/png', name: 'a2.png', type: 'resource_link', uri: `desktop-driver://sessions/${session}/artifacts/a2` },
      ]);
      const { contents } = await client.readResource({ uri: `desktop-driver://sessions/${session}/artifacts/a1` });
      expect(contents).toEqual([{ blob: onePixelPng, mimeType: 'image/png', uri: `desktop-driver://sessions/${session}/artifacts/a1` }]);

      await expect(client.readResource({ uri: `desktop-driver://sessions/${session}/artifacts/a9` })).rejects.toThrow();
      await call(client, 'desktop_session', { action: 'close' });
      await open(client, harness);
      // Artifact ids restart in every session, so a closed session's link must not read the new session's capture.
      await expect(client.readResource({ uri: `desktop-driver://sessions/${session}/artifacts/a1` })).rejects.toThrow(
        /^MCP error -32602: That capture belongs to a session that is no longer open\.$/,
      );
    });
  });

  test('reassembles a capture larger than one page from its pages', async () => {
    const screenshot = randomBytes(1024 * 1024 + 4096);
    await withFixture({ screenshot }, async ({ client, harness }) => {
      const session = await open(client, harness);
      const captured = await call(client, 'desktop_capture', { image: true });
      expect(json(captured)).toMatchObject({ result: { imageOmitted: 'too-large' } });
      const { contents } = await client.readResource({ uri: `desktop-driver://sessions/${session}/artifacts/a1` });
      const blob = (contents[0] as { blob: string }).blob;
      expect(createHash('sha256').update(Buffer.from(blob, 'base64')).digest('hex')).toBe(
        createHash('sha256').update(screenshot).digest('hex'),
      );
    });
  });

  test('reports progress while a check waits, and a cancelled call reaches the service as cancelled', async () => {
    await withFixture(
      {},
      async ({ client, harness }) => {
        await open(client, harness);
        const never = { expect: { valueContains: 'never' }, find: { automationId: 'input-name' } };
        const ticks: number[] = [];
        const waited = await call(
          client,
          'desktop_check',
          { ...never, waitMs: 400 },
          { onprogress: ({ progress }: { progress: number }) => ticks.push(progress) },
        );
        expect(json(waited)).toMatchObject({ result: { status: 'timed-out' } });
        expect(ticks.length).toBeGreaterThan(0);

        const caller = new AbortController();
        const cancelled = call(client, 'desktop_check', { ...never, waitMs: 10_000 }, { signal: caller.signal });
        setTimeout(() => caller.abort(), 200);
        await expect(cancelled).rejects.toThrow();
        const started = Date.now();
        let entries: { error?: { reason?: string }; operation: string }[] = [];
        while (Date.now() - started < 3000 && !entries.some((entry) => entry.error?.reason === 'cancelled')) {
          entries = (json(await call(client, 'desktop_observe', { journal: {} })) as { result: { entries: typeof entries } }).result
            .entries;
        }
        expect(entries).toContainEqual(
          expect.objectContaining({ error: expect.objectContaining({ reason: 'cancelled' }), operation: 'check' }),
        );
      },
      50,
    );
  });

  test('reports a lost service without its details, forgets the session, and reconnects on the next call', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    let harness = await createDesktopDriverTestHarness({ features });
    let connects = 0;
    let unavailable = false;
    const client = await connectClient(async () => {
      connects += 1;
      if (unavailable) {
        throw new Error('descriptor at /private/path is missing');
      }
      return testConnection(harness);
    });
    try {
      await open(client, harness);
      await harness.close();
      const lost = await call(client, 'desktop_observe');
      expect(json(lost)).toMatchObject({ reason: 'service-unavailable' });

      unavailable = true;
      const refused = await call(client, 'desktop_session');
      expect(JSON.stringify(json(refused))).not.toContain('/private/path');
      expect(errors).toHaveBeenCalledWith('desktop-driver-mcp: connecting failed; verify private discovery and the service identity.');
      expect(JSON.stringify(errors.mock.calls)).not.toContain('/private/path');

      unavailable = false;
      harness = await createDesktopDriverTestHarness({ features });
      expect(json(await call(client, 'desktop_session'))).toEqual({ targets: [expect.objectContaining({ id: harness.target.id })] });
      expect(connects).toBe(3);
    } finally {
      await client.close();
      await harness.close();
      errors.mockRestore();
    }
  });

  test('ends the open session when the MCP client goes away', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const driver = testConnection(harness).client;
    const client = await connectClient(async () => ({ ...testConnection(harness), client: driver }));
    try {
      const session = await open(client, harness);
      await client.close();
      const started = Date.now();
      let gone = false;
      while (!gone && Date.now() - started < 3000) {
        try {
          harness.server.sessions.get(session);
        } catch {
          gone = true;
        }
      }
      expect(gone).toBe(true);
    } finally {
      await harness.close();
    }
  });

  test('recovers after a protected service is replaced on the same port without replaying the old call', async () => {
    let authority = new DesktopAuthority();
    let grant = authority.issue({ label: 'agent', targets: '*' });
    let harness = await createDesktopDriverTestHarness({ features }, undefined, { authority });
    let connects = 0;
    const client = await connectClient(async () => {
      connects += 1;
      return {
        client: createDesktopDriverClient({ grant: grant.token, url: harness.server.url }),
        incarnation: authority.incarnation,
        principal: grant.id,
      };
    });
    try {
      await open(client, harness);
      const port = Number(new URL(harness.server.url).port);
      await harness.close();
      authority = new DesktopAuthority();
      grant = authority.issue({ label: 'agent', targets: '*' });
      harness = await createDesktopDriverTestHarness({ features }, undefined, { authority, port });
      expect(json(await call(client, 'desktop_observe'))).toMatchObject({ reason: 'service-unavailable' });
      expect(connects).toBe(1);
      expect(json(await call(client, 'desktop_session'))).not.toHaveProperty('session');
      expect(connects).toBe(2);
      expect(json(await call(client, 'desktop_observe'))).toMatchObject({ reason: 'no-session' });
      await open(client, harness);
      authority.revoke(grant.id);
      expect(json(await call(client, 'desktop_observe'))).toMatchObject({ reason: 'service-unavailable' });
      grant = authority.issue({ label: 'agent', targets: '*' });
      expect(json(await call(client, 'desktop_session'))).not.toHaveProperty('session');
      expect(connects).toBe(3);
    } finally {
      await client.close();
      await harness.close();
    }
  });

  test('serializes acquisition and cleans up a session acquired after disposal started', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const entered = deferred();
    const finish = deferred();
    let acquired: string | undefined;
    const connection = testConnection(harness, async (input, init) => {
      const response = await fetch(input, init);
      if (init?.method === 'POST' && String(input).endsWith('/session')) {
        acquired = ((await response.clone().json()) as { value: { sessionId: string } }).value.sessionId;
        entered.resolve();
        await finish.promise;
      }
      return response;
    });
    const controller = new DesktopController(async () => connection);
    const request = { launch: true, target: harness.target.id };
    try {
      const opening = controller.open(request);
      const opened = expect(opening).rejects.toMatchObject({ reason: 'connection-closed' });
      await entered.promise;
      const again = expect(controller.open(request)).rejects.toMatchObject({ reason: 'connection-closed' });
      const disposed = controller.dispose();
      finish.resolve();
      await Promise.all([opened, again, disposed]);
      await expect(connection.client.request('GET', `/session/${acquired}/window`)).rejects.toMatchObject({ code: 'invalid session id' });
      await expect(controller.open(request)).rejects.toMatchObject({ reason: 'connection-closed' });
    } finally {
      finish.resolve();
      await controller.dispose();
      await harness.close();
    }
  });

  test('admits only one of concurrent opens', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const controller = new DesktopController(async () => testConnection(harness));
    try {
      const results = await Promise.allSettled([
        controller.open({ launch: true, target: harness.target.id }),
        controller.open({ launch: true, target: 'another-target' }),
      ]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1]).toMatchObject({ status: 'rejected', reason: { reason: 'session-open' } });
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test('does not acquire after disposal while discovery is still pending', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    const entered = deferred();
    const finish = deferred();
    let creates = 0;
    const connection = testConnection(harness, async (input, init) => {
      if (init?.method === 'POST' && String(input).endsWith('/session')) creates += 1;
      return fetch(input, init);
    });
    const controller = new DesktopController(async () => {
      entered.resolve();
      await finish.promise;
      return connection;
    });
    try {
      const opening = expect(controller.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({
        reason: 'connection-closed',
      });
      await entered.promise;
      const disposed = controller.dispose();
      finish.resolve();
      await Promise.all([opening, disposed]);
      expect(creates).toBe(0);
    } finally {
      finish.resolve();
      await controller.dispose();
      await harness.close();
    }
  });

  test('retains the session after a lost mutation response without replaying the mutation', async () => {
    const harness = await createDesktopDriverTestHarness({ features });
    let mutations = 0;
    let delegations = 0;
    const connection = testConnection(harness, async (input, init) => {
      const response = await fetch(input, init);
      if (String(input).endsWith('/furn/grants/connection')) delegations += 1;
      if (String(input).endsWith('/furn/ops/sequence')) {
        mutations += 1;
        await response.body?.cancel();
        throw new Error('injected loss after dispatch');
      }
      return response;
    });
    const controller = new DesktopController(async () => connection);
    try {
      const session = await controller.open({ launch: true, target: harness.target.id });
      await expect(
        controller.run('sequence', {
          steps: [{ act: { action: 'type', find: { automationId: 'input-name' }, text: 'Ada' } }],
        }),
      ).rejects.toMatchObject({ reason: 'service-unavailable' });
      expect((await controller.status()).session?.id).toBe(session.id);
      await expect(
        controller.run('check', { expect: { valueContains: 'Ada' }, find: { automationId: 'input-name' } }),
      ).resolves.toMatchObject({
        response: { result: { status: 'passed' } },
      });
      expect(mutations).toBe(1);
      expect(delegations).toBe(1);
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test.each(['before', 'after'] as const)('retains deletion responsibility when transport fails %s DELETE dispatch', async (failure) => {
    const harness = await createDesktopDriverTestHarness({ features });
    let failDelete = true;
    let creates = 0;
    const connection = testConnection(harness, async (input, init) => {
      if (init?.method === 'POST' && String(input).endsWith('/session')) creates += 1;
      if (init?.method === 'DELETE' && failDelete) {
        failDelete = false;
        if (failure === 'after') await fetch(input, init);
        throw new Error('injected transport failure');
      }
      return fetch(input, init);
    });
    const controller = new DesktopController(async () => connection);
    try {
      const session = await controller.open({ launch: true, target: harness.target.id });
      await expect(controller.close()).rejects.toMatchObject({ reason: 'service-unavailable' });
      expect(controller.session).toBe(session.id);
      await expect(controller.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({ reason: 'session-open' });
      expect(creates).toBe(1);
      expect(await controller.close()).toEqual({ closed: session.id });
      await controller.open({ launch: true, target: harness.target.id });
      expect(creates).toBe(2);
    } finally {
      await controller.dispose();
      await harness.close();
    }
  });

  test('fences an ambiguous acquisition instead of retrying it on the same authority', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const harness = await createDesktopDriverTestHarness({ features });
    let creates = 0;
    const connection = testConnection(harness, async (input, init) => {
      const response = await fetch(input, init);
      if (init?.method === 'POST' && String(input).endsWith('/session')) {
        creates += 1;
        await response.body?.cancel();
        throw new Error('the session was created but its response was lost');
      }
      return response;
    });
    const controller = new DesktopController(async () => connection);
    try {
      await expect(controller.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({ reason: 'service-unavailable' });
      expect(await controller.status()).toMatchObject({ sessionState: 'uncertain' });
      await expect(controller.open({ launch: true, target: harness.target.id })).rejects.toMatchObject({ reason: 'session-uncertain' });
      await expect(controller.close()).rejects.toMatchObject({ reason: 'session-uncertain' });
      expect(creates).toBe(1);
    } finally {
      await controller.dispose();
      await harness.close();
      expect(errors).not.toHaveBeenCalled();
      errors.mockRestore();
    }
  });
});

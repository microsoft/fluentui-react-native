import { createHash, randomBytes } from 'node:crypto';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver/storybook';
import { createDesktopDriverStoryHarness, createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import type { DesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import type { ConnectDesktopDriver } from './connection.js';
import { createDesktopDriverMcpServer } from './server.js';

type Fixture = { client: Client; harness: DesktopDriverTestHarness };

const features = { accessibilityActions: true, boundedObservation: true };
const onePixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function connectClient(connect: ConnectDesktopDriver, progressIntervalMs?: number): Promise<Client> {
  const server = createDesktopDriverMcpServer({ connect, version: '0.0.0-test', ...(progressIntervalMs ? { progressIntervalMs } : {}) });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientTransport);
  return client;
}

async function withFixture(
  options: Parameters<typeof createDesktopDriverTestHarness>[0],
  body: (fixture: Fixture) => Promise<void>,
  progressIntervalMs?: number,
): Promise<void> {
  const harness = await createDesktopDriverTestHarness({ ...options, features: { ...features, ...options?.features } });
  const client = await connectClient(async () => createDesktopDriverClient({ url: harness.server.url }), progressIntervalMs);
  try {
    await body({ client, harness });
  } finally {
    await client.close();
    await harness.close();
  }
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
      // The whole tool list is read into every agent's context: about 17.5 KB today, well under the 29 KB operation catalog.
      expect(JSON.stringify(tools).length).toBeLessThan(18_500);
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
        targets: [{ endpoint: 'windows', id: harness.target.id, platformName: 'windows', renderer: 'fabric' }],
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
    const client = await connectClient(async () => createDesktopDriverClient({ url: harness.server.url }));
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
      for (const args of [
        { list: {}, story: { storyId: 'components-button--default' } },
        { list: {}, requestId: 'r' },
      ]) {
        expect((await call(client, 'desktop_story', args)).isError).toBe(true);
      }
    } finally {
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
    const client = await connectClient(async (): Promise<DesktopDriverClient> => {
      connects += 1;
      if (unavailable) {
        throw new Error('descriptor at /private/path is missing');
      }
      return createDesktopDriverClient({ url: harness.server.url });
    });
    try {
      await open(client, harness);
      await harness.close();
      const lost = await call(client, 'desktop_observe');
      expect(json(lost)).toMatchObject({ reason: 'service-unavailable' });

      unavailable = true;
      const refused = await call(client, 'desktop_session');
      expect(JSON.stringify(json(refused))).not.toContain('/private/path');
      expect(errors).toHaveBeenCalledWith(expect.stringContaining('/private/path'));

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
    const driver = createDesktopDriverClient({ url: harness.server.url });
    const client = await connectClient(async () => driver);
    try {
      const session = await open(client, harness);
      await client.close();
      const started = Date.now();
      let gone = false;
      while (!gone && Date.now() - started < 3000) {
        gone = await driver.request('GET', `/session/${session}/window`).then(
          () => false,
          (error: { code?: string }) => error.code === 'invalid session id',
        );
      }
      expect(gone).toBe(true);
    } finally {
      await harness.close();
    }
  });
});

import { z } from 'zod';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { OperationCatalogEntry } from '../operations/index.js';
import { createFakeTree, fakeTreeSize } from '../testing/fakeTree.js';
import type { FakeTreeShape } from '../testing/fakeTree.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverServerOptions } from './createDesktopDriverServer.js';

type RawResponse = { status: number; value: Record<string, unknown> };

type Fixture = {
  harness: DesktopDriverTestHarness;
  /** POSTs a raw body to an operation route, for what the client cannot express: oversized or malformed requests. */
  post(operation: string, body: unknown): Promise<RawResponse>;
  session: DesktopSessionClient;
};

const observable = { accessibilityActions: true, boundedObservation: true };
const requestIdPattern = expect.stringMatching(/^r\d+$/);

function treeWindows(shape: FakeTreeShape): FakeDesktopHostOptions['windows'] {
  return [{ elements: createFakeTree(shape), id: 'window-1', title: 'Tree' }];
}

function newSession(harness: DesktopDriverTestHarness): Promise<DesktopSessionClient> {
  return createDesktopDriverClient({ url: harness.server.url }).newSession({
    alwaysMatch: {
      'furn:clickMode': 'accessibility',
      'furn:launchMode': 'launch',
      'furn:target': harness.target.id,
      platformName: 'windows',
    },
  });
}

async function post(
  harness: DesktopDriverTestHarness,
  session: DesktopSessionClient,
  operation: string,
  body: unknown,
): Promise<RawResponse> {
  const response = await fetch(`${harness.server.url}/session/${session.id}/furn/ops/${operation}`, {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
  return { status: response.status, value: ((await response.json()) as { value: Record<string, unknown> }).value };
}

/** Runs `body` against a driver server whose fake provider supports bounded observation unless `options` say otherwise. */
async function withFixture(
  options: FakeDesktopHostOptions,
  body: (fixture: Fixture) => Promise<void>,
  serverOptions?: Omit<DesktopDriverServerOptions, 'targets'>,
): Promise<void> {
  const harness = await createDesktopDriverTestHarness(
    { ...options, features: { ...observable, ...options.features } },
    undefined,
    serverOptions,
  );
  try {
    const session = await newSession(harness);
    await body({ harness, post: (operation, request) => post(harness, session, operation, request), session });
  } finally {
    await harness.close();
  }
}

async function catalogEntry(session: DesktopSessionClient, name: string): Promise<OperationCatalogEntry> {
  const entry = (await session.operations()).operations.find((candidate) => candidate.name === name);
  if (!entry) {
    throw new Error(`The catalog has no operation named "${name}".`);
  }
  return entry;
}

/** The failure of an operation, as a caller sees it: a WebDriver error carrying a machine reason. */
function operationFailure(code: string, reason: string, operation: string) {
  return { code, data: { operation, reason, requestId: requestIdPattern, schemaVersion: 1 } };
}

async function refTo(session: DesktopSessionClient, selector: Parameters<DesktopSessionClient['find']>[0]): Promise<string> {
  const { matches } = (await session.find(selector)).result;
  return matches[0].ref;
}

describe('Desktop Driver agent operations', () => {
  describe('the catalog', () => {
    test('lists the read operations a bounded-observation provider supports, with schemas that accept real results', async () => {
      await withFixture({}, async ({ session }) => {
        const catalog = await session.operations();
        const entries = Object.fromEntries(catalog.operations.map((entry) => [entry.name, entry]));
        expect(catalog.schemaVersion).toBe(1);
        expect(entries).toMatchObject({
          find: { available: true, effect: 'read' },
          journal: { available: true, effect: 'read' },
          observe: { available: true, effect: 'read' },
        });

        const results = {
          find: (await session.find({ role: 'button' })).result,
          journal: (await session.journal()).result,
          observe: (await session.observe({ view: 'all' })).result,
        };
        for (const [name, result] of Object.entries(results)) {
          expect(() => z.fromJSONSchema(entries[name].output as Parameters<typeof z.fromJSONSchema>[0]).parse(result)).not.toThrow();
        }
        expect(() => z.fromJSONSchema(entries.observe.input as Parameters<typeof z.fromJSONSchema>[0]).parse({ bogus: 1 })).toThrow();
      });
    });

    test('marks observation unavailable on a provider without it, and keeps the journal and legacy tree working', async () => {
      await withFixture({ features: { boundedObservation: false } }, async ({ session }) => {
        const unavailable = { available: false, unavailableReason: 'bounded-observation-unsupported' };
        await expect(catalogEntry(session, 'observe')).resolves.toMatchObject(unavailable);
        await expect(catalogEntry(session, 'find')).resolves.toMatchObject(unavailable);
        await expect(catalogEntry(session, 'journal')).resolves.toMatchObject({ available: true });

        await expect(session.observe()).rejects.toMatchObject(
          operationFailure('unsupported operation', 'bounded-observation-unsupported', 'observe'),
        );
        await expect(session.getTree()).resolves.not.toHaveLength(0);

        const journal = await session.journal();
        expect(journal.result.entries).toMatchObject([
          { error: { code: 'unsupported operation', reason: 'bounded-observation-unsupported' }, operation: 'observe', outcome: 'error' },
        ]);
      });
    });
  });

  describe('observe and find', () => {
    test('observe shows the interactive view by default, the whole tree on request, and structured nodes on demand', async () => {
      await withFixture({}, async ({ session }) => {
        const interactive = (await session.observe()).result;
        const lines = interactive.outline!.split('\n');
        expect(interactive).toMatchObject({ complete: true, view: 'interactive' });
        expect(lines).toHaveLength(3);
        expect(lines[0]).toMatch(/^application \w+ #app-root\b/);
        expect(lines[1]).toMatch(/^ button "Primary" \w+ #button-primary\b/);
        expect(lines[2]).toMatch(/^ textbox "Name" \w+ #input-name\b/);

        const everything = (await session.observe({ view: 'all' })).result;
        expect(everything.outline!.split('\n')).toHaveLength(4);
        expect(everything.outline).toMatch(/^ group /m);

        const nodes = (await session.observe({ format: 'nodes', view: 'all' })).result;
        expect(nodes.outline).toBeUndefined();
        expect(nodes.nodes).toHaveLength(4);
        expect(nodes.nodes![0]).toMatchObject({ automationId: 'app-root', depth: 0, role: 'application' });
      });
    });

    test('observe scopes to the subtree under a reference', async () => {
      await withFixture({}, async ({ session }) => {
        const ref = await refTo(session, { role: 'textbox' });
        const scoped = (await session.observe({ view: 'all', within: ref })).result;
        expect(scoped.sample).toMatchObject({ root: ref, scope: 'element' });
        expect(scoped.outline).toMatch(/^textbox "Name" /);
        expect(scoped.counts.emitted).toBe(1);
      });
    });

    test('find says whether a match is unique, absent, or one of several, and whether a gap could hide one', async () => {
      await withFixture({}, async ({ session }) => {
        await expect(session.find({ role: 'textbox' })).resolves.toMatchObject({
          result: { matches: [{ automationId: 'input-name', match: 'definite', name: 'Name', role: 'textbox' }], outcome: 'unique' },
        });
        await expect(session.find({ role: 'checkbox' })).resolves.toMatchObject({ result: { matches: [], outcome: 'none' } });
        await expect(session.find({})).rejects.toMatchObject(operationFailure('invalid argument', 'invalid-input', 'find'));
      });

      await withFixture({ windows: treeWindows({ depth: 1, fanout: 3 }) }, async ({ session }) => {
        const found = (await session.find({ role: 'button' })).result;
        expect(found.outcome).toBe('multiple');
        expect(found.matches.map(({ name }) => name)).toEqual(['Name n.0', 'Name n.1', 'Name n.2']);
      });

      await withFixture(
        { observation: { unreadableChildrenOf: ['n'] }, windows: treeWindows({ depth: 1, fanout: 1 }) },
        async ({ session }) => {
          await expect(session.find({ role: 'button' })).resolves.toMatchObject({
            result: { complete: false, outcome: 'inconclusive', reasons: ['incomplete'] },
          });
        },
      );
    });
  });

  describe('provider records', () => {
    test('releases every record a bounded observation did not return, so retention stays at the references held', async () => {
      const shape = { depth: 3, fanout: 6 };
      await withFixture({ windows: treeWindows(shape) }, async ({ harness, session }) => {
        const { refs } = harness.server.sessions.get(session.id).operations;
        for (let repeat = 0; repeat < 4; repeat += 1) {
          const { result } = await session.observe({ budget: { maxNodes: 10 }, view: 'all' });
          expect(result.counts).toMatchObject({ emitted: 10 });
          expect(result.counts.visited).toBe(fakeTreeSize(shape));
          expect(harness.host.trackedElementCount).toBe(refs.size);
        }
        expect(refs.size).toBe(10);
      });
    });

    test('never releases an element a WebDriver command still holds', async () => {
      await withFixture({}, async ({ session }) => {
        const button = await session.findElement('accessibility id', 'button-primary');
        // The button is read but not returned, so the observation queues its record for release unless a W3C id holds it.
        const { result } = await session.observe({ budget: { maxNodes: 1 } });
        expect(result.counts).toMatchObject({ emitted: 1 });
        await expect(button.getText()).resolves.toBe('Primary');
      });
    });
  });

  describe('references', () => {
    test('tells apart a reference that is malformed, never issued, foreign, from an earlier incarnation, expired, and stale', async () => {
      const other = await createDesktopDriverTestHarness({ features: observable });
      try {
        const foreign = await refTo(await newSession(other), { role: 'button' });
        await withFixture({}, async ({ harness, session }) => {
          const state = harness.server.sessions.get(session.id);
          const ref = await refTo(session, { role: 'button' });
          const failure = (code: string, reason: string) => operationFailure(code, reason, 'observe');

          await expect(session.observe({ within: 'not a ref!' })).rejects.toMatchObject(failure('invalid argument', 'ref-malformed'));
          await expect(session.observe({ within: ref.replace(/\d+$/, '9999') })).rejects.toMatchObject(
            failure('no such element', 'ref-unknown'),
          );
          await expect(session.observe({ within: foreign })).rejects.toMatchObject(failure('no such element', 'ref-foreign'));

          // The provider forgets the record, as when its application closed the element's window or released it.
          const nativeId = state.operations.refs.resolve(ref, state.previewGeneration);
          expect(nativeId).toMatchObject({ ok: true });
          await harness.host.releaseElements([(nativeId as { entry: { nativeId: string } }).entry.nativeId], new AbortController().signal);
          await expect(session.observe({ within: ref })).rejects.toMatchObject(failure('stale element reference', 'ref-stale'));
          await expect(session.observe({ within: ref })).rejects.toMatchObject(failure('stale element reference', 'ref-expired'));

          const replaced = await refTo(session, { role: 'button' });
          harness.server.sessions.invalidatePreview(state);
          await expect(session.observe({ within: replaced })).rejects.toMatchObject(
            failure('stale element reference', 'ref-region-changed'),
          );

          const current = await refTo(session, { role: 'button' });
          state.operations.startIncarnation();
          await expect(session.observe({ within: current })).rejects.toMatchObject(
            failure('stale element reference', 'ref-earlier-incarnation'),
          );
          expect((await session.journal()).session.incarnation).toBe(2);
        });
      } finally {
        await other.close();
      }
    });

    test('reports a failure as a bounded WebDriver error with no stack trace', async () => {
      await withFixture({}, async ({ post: raw }) => {
        const response = await raw('observe', { input: { within: 'not a ref!' }, requestId: 'probe-1' });
        expect(response.status).toBe(400);
        expect(response.value).toMatchObject({
          data: { operation: 'observe', reason: 'ref-malformed', requestId: 'probe-1', schemaVersion: 1 },
          error: 'invalid argument',
          stacktrace: '',
        });
      });
    });
  });

  describe('requests', () => {
    test('rejects an unknown operation, a wrong method, and a malformed envelope with a reason an agent can branch on', async () => {
      await withFixture({}, async ({ post: raw, session }) => {
        await expect(session.operation('nope')).rejects.toMatchObject(operationFailure('unknown command', 'unknown-operation', 'nope'));
        await expect(session.command('GET', '/furn/ops/observe')).rejects.toMatchObject({
          code: 'unknown command',
          message: 'No operation route matches GET /furn/ops/observe.',
        });
        await expect(session.observe({ budget: { maxNodes: 0 } })).rejects.toMatchObject({
          ...operationFailure('invalid argument', 'invalid-input', 'observe'),
          message: expect.stringContaining('budget.maxNodes'),
        });

        const failures = await Promise.all([
          raw('observe', { input: {}, extra: 1 }),
          raw('observe', { input: {}, requestId: 'has spaces' }),
          raw('observe', { input: {}, version: 2 }),
          raw('observe', '[]'),
        ]);
        expect(failures.map(({ value }) => (value.data as { reason: string }).reason)).toEqual([
          'invalid-envelope',
          'invalid-request-id',
          'unsupported-version',
          'invalid-envelope',
        ]);
      });
    });

    test('refuses a body larger than an operation ever needs', async () => {
      await withFixture({}, async ({ session }) => {
        await expect(session.observe({ within: 'x'.repeat(70_000) })).rejects.toMatchObject({
          code: 'invalid argument',
          message: expect.stringContaining('65536-byte'),
        });
        await expect(session.observe()).resolves.toMatchObject({ result: { complete: true } });
      });
    });

    test('answers under the id the caller chose, and journals the call under it', async () => {
      await withFixture({}, async ({ session }) => {
        const response = await session.observe({}, { requestId: 'agent-step-1' });
        expect(response.requestId).toBe('agent-step-1');
        const { entries } = (await session.journal()).result;
        expect(entries).toMatchObject([
          { operation: 'observe', outcome: 'ok', requestId: 'agent-step-1', summary: { view: 'interactive' } },
        ]);
      });
    });
  });

  describe('the caller leaving', () => {
    test('abandons a walk when the caller disconnects, journals it as cancelled, and keeps the session usable', async () => {
      await withFixture(
        { observation: { readDelayMs: 150 }, windows: treeWindows({ depth: 2, fanout: 5 }) },
        async ({ harness, session }) => {
          let walking!: () => void;
          const walkStarted = new Promise<void>((resolve) => {
            walking = resolve;
          });
          const observe = harness.host.observe.bind(harness.host);
          harness.host.observe = (request, signal) => {
            walking();
            return observe(request, signal);
          };

          const caller = new AbortController();
          const disconnected = fetch(`${harness.server.url}/session/${session.id}/furn/ops/observe`, {
            body: JSON.stringify({ input: { view: 'all' }, requestId: 'walk' }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            signal: caller.signal,
          });
          await walkStarted;
          caller.abort();
          await expect(disconnected).rejects.toThrow();

          // The journal read queues behind the abandoned walk, which would take over four seconds if it ran to the end.
          const left = Date.now();
          const { entries } = (await session.journal()).result;
          expect(Date.now() - left).toBeLessThan(1500);
          expect(entries).toMatchObject([{ error: { reason: 'cancelled' }, operation: 'observe', outcome: 'error', requestId: 'walk' }]);

          await expect(session.find({ automationId: 'auto-n.0.0' })).resolves.toMatchObject({ result: { outcome: 'unique' } });
        },
      );
    });
  });

  describe('what applications display', () => {
    test('is withheld when the operator denies content, while names and states stay available', async () => {
      await withFixture(
        {},
        async ({ session }) => {
          const { result } = await session.observe({ format: 'nodes', view: 'all' });
          expect(result.facts).not.toEqual(expect.arrayContaining(['value']));
          expect(JSON.stringify(result.nodes)).not.toContain('"value"');
          await expect(session.observe({ facts: ['value'] })).rejects.toMatchObject(
            operationFailure('unsupported operation', 'content-denied', 'observe'),
          );
          await expect(session.find({ text: 'Primary' })).rejects.toMatchObject(
            operationFailure('unsupported operation', 'content-denied', 'find'),
          );
          await expect(session.find({ name: 'Primary' })).resolves.toMatchObject({ result: { outcome: 'unique' } });
        },
        { operations: { content: 'deny' } },
      );
    });

    test('never reaches the journal, whatever a call asked for', async () => {
      await withFixture({}, async ({ session }) => {
        await session.observe({ facts: ['text', 'value'], view: 'all' });
        await session.find({ text: 'Primary' });
        await session.find({ name: 'Primary' });
        await expect(session.observe({ within: 'Primary' })).rejects.toBeDefined();

        const journal = JSON.stringify((await session.journal()).result);
        expect(journal).toContain('"operation":"find"');
        expect(journal).not.toContain('Primary');
        expect(journal).not.toContain('button-primary');
      });
    });
  });

  describe('a quarantined target', () => {
    test('still answers reads, and says it is quarantined', async () => {
      await withFixture({ faults: { click: { mode: 'lost-response' } } }, async ({ harness, session }) => {
        const button = await session.findElement('accessibility id', 'button-primary');
        const timeouts = harness.server.sessions.get(session.id).desktopTimeouts;
        const previous = timeouts.nativeCommand;
        timeouts.nativeCommand = 10;
        try {
          await expect(button.click()).rejects.toMatchObject({ code: 'timeout', data: { mutation: { quarantined: true } } });
        } finally {
          timeouts.nativeCommand = previous;
        }

        const observed = await session.observe();
        expect(observed.session).toMatchObject({ incarnation: 1, quarantined: true });
        expect(observed.result.complete).toBe(true);
        await expect(session.find({ automationId: 'button-primary' })).resolves.toMatchObject({
          result: { outcome: 'unique' },
          session: { quarantined: true },
        });
      });
    });
  });
});

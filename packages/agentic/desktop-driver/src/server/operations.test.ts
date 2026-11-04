import { createHash } from 'node:crypto';

import { z } from 'zod';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import { translateNativeError } from '../hosts/native/NativeDesktopHost.js';
import { NativeDriverError } from '../native/NativeDriverError.js';
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

const actWindow: FakeDesktopHostOptions['windows'] = [
  {
    elements: [
      {
        id: 'root',
        name: 'Form',
        rect: { height: 600, width: 800, x: 0, y: 0 },
        role: 'window',
        scope: 'application',
        windowId: 'window-1',
      },
      ...(
        [
          ['save', 'button', 'Save', 10, {}],
          ['off', 'button', 'Off', 50, { enabled: false }],
          ['hidden', 'button', 'Hidden', 90, { visible: false }],
          ['covered', 'button', 'Covered', 130, {}],
          ['overlay', 'group', 'Overlay', 120, {}],
          ['field', 'textbox', 'Field', 200, { value: '' }],
          ['agree', 'checkbox', 'Agree', 240, { checked: false }],
          ['dup-1', 'button', 'Dup', 280, {}],
          ['dup-2', 'button', 'Dup', 320, {}],
        ] as const
      ).map(([id, role, name, y, extra]) => ({
        automationId: id,
        id,
        name,
        parentId: 'root',
        rect: { height: id === 'overlay' ? 60 : 30, width: id === 'overlay' ? 300 : 100, x: 10, y },
        role,
        scope: 'preview' as const,
        windowId: 'window-1',
        ...extra,
      })),
    ],
    id: 'window-1',
    title: 'Form',
  },
];

/** Finds one element by automation id and returns what `act` needs to cite it. */
async function proven(session: DesktopSessionClient, automationId: string): Promise<{ ref: string; sample: string }> {
  const { result } = await session.find({ automationId });
  expect(result.outcome).toBe('unique');
  return { ref: result.matches[0].ref, sample: result.sample.id };
}

const rejected = (quarantined = false) => ({ disposition: 'rejected', effect: 'none', quarantined });

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
          act: { available: true, effect: 'mutate' },
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
    test('retains the bounded samples needed for paging without growing across repeated observations', async () => {
      const shape = { depth: 3, fanout: 6 };
      await withFixture({ windows: treeWindows(shape) }, async ({ harness, session }) => {
        const { refs } = harness.server.sessions.get(session.id).operations;
        for (let repeat = 0; repeat < 4; repeat += 1) {
          const { result } = await session.observe({ budget: { maxNodes: 10 }, view: 'all' });
          expect(result.counts).toMatchObject({ emitted: 10 });
          expect(result.counts.visited).toBe(fakeTreeSize(shape));
          expect(harness.host.trackedElementCount).toBe(fakeTreeSize(shape));
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
          const disconnected = session.observe({ view: 'all' }, { requestId: 'walk', signal: caller.signal });
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

  describe('an application that stops responding', () => {
    test('fails a read with a reason an agent can wait on, journals it, and recovers when the application answers', async () => {
      await withFixture({ windows: treeWindows({ depth: 1, fanout: 2 }) }, async ({ harness, post: raw, session }) => {
        let responding = false;
        const observe = harness.host.observe.bind(harness.host);
        harness.host.observe = async (request, signal) => {
          if (!responding) {
            throw translateNativeError(
              new NativeDriverError(
                'automation-failed',
                'Reading AXRole failed because the target application did not complete the accessibility request.',
                {
                  axError: { name: 'cannotComplete' },
                  reason: 'target-non-response',
                },
              ),
            );
          }
          return observe(request, signal);
        };

        const response = await raw('observe', { requestId: 'hung' });
        expect(response.status).toBe(500);
        expect(response.value).toMatchObject({
          data: {
            nativeCode: 'automation-failed',
            operation: 'observe',
            reason: 'target-non-response',
            requestId: 'hung',
            schemaVersion: 1,
          },
          error: 'unknown error',
          stacktrace: '',
        });
        expect(response.value.data).not.toHaveProperty('axError');

        const { entries } = (await session.journal()).result;
        expect(entries).toMatchObject([
          { error: { code: 'unknown error', reason: 'target-non-response' }, operation: 'observe', outcome: 'error', requestId: 'hung' },
        ]);

        responding = true;
        const recovered = await session.observe();
        expect(recovered.session.quarantined).toBeUndefined();
        expect(recovered.result.complete).toBe(true);
      });
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

  describe('act', () => {
    test('clicks, activates, types into, and clears a proven element, and says how each was carried out', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        await expect(session.act({ action: 'click', ...(await proven(session, 'agree')) })).resolves.toMatchObject({
          result: { action: 'click', disposition: 'applied', mechanism: 'physical-pointer', window: 'window-1' },
        });
        await expect(session.act({ action: 'activate', ...(await proven(session, 'save')) })).resolves.toMatchObject({
          result: { mechanism: 'accessibility' },
        });
        const field = await proven(session, 'field');
        await expect(session.act({ action: 'type', text: 'secret words', ...field })).resolves.toMatchObject({
          result: { mechanism: 'keyboard' },
        });
        await expect(session.act({ action: 'clear', ...field })).resolves.toMatchObject({ result: { mechanism: 'provider' } });

        const dispatched = harness.host.actions.map(({ elementId, ...action }) =>
          // The fake issues a fresh record id, such as `save~2`, each time an element is observed again.
          elementId === undefined ? action : { ...action, elementId: String(elementId).split('~')[0] },
        );
        expect(dispatched).toEqual(
          expect.arrayContaining([
            { type: 'activate', windowId: 'window-1' },
            { elementId: 'agree', mode: 'physical', type: 'click' },
            { elementId: 'save', mode: 'accessibility', type: 'click' },
            { elementId: 'field', text: 'secret words', type: 'send-keys' },
            { elementId: 'field', type: 'clear' },
          ]),
        );
        const journal = await session.journal();
        expect(journal.result.entries.filter((entry) => entry.operation === 'act')).toMatchObject([
          { effect: 'mutate', outcome: 'ok', summary: { action: 'click', mechanism: 'physical-pointer' } },
          { summary: { action: 'activate', mechanism: 'accessibility' } },
          { summary: { action: 'type', mechanism: 'keyboard' } },
          { summary: { action: 'clear', mechanism: 'provider' } },
        ]);
        expect(JSON.stringify(journal.result)).not.toContain('secret words');
      });
    });

    test('acts only on a reference the cited find proved unique', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, post, session }) => {
        const several = await session.find({ name: 'Dup' });
        expect(several.result.outcome).toBe('multiple');
        const save = await proven(session, 'save');
        const agree = await proven(session, 'agree');
        const refused = (reason: string, code = 'invalid argument') => ({
          ...operationFailure(code, reason, 'act'),
          data: { ...operationFailure(code, reason, 'act').data, mutation: rejected() },
        });

        await expect(
          session.act({ action: 'activate', ref: several.result.matches[0].ref, sample: several.result.sample.id }),
        ).rejects.toMatchObject(refused('sample-not-unique'));
        await expect(session.act({ action: 'activate', ref: save.ref, sample: agree.sample })).rejects.toMatchObject(
          refused('ref-not-proven'),
        );
        await expect(session.act({ action: 'activate', ref: save.ref, sample: 'o999' })).rejects.toMatchObject(
          refused('sample-not-unique'),
        );

        harness.host.setElementName('save', 'Saved');
        await expect(session.act({ action: 'activate', ...save })).rejects.toMatchObject(
          refused('fingerprint-changed', 'stale element reference'),
        );

        for (const input of [
          { action: 'click', text: 'x', ...agree },
          { action: 'type', ...agree },
          { action: 'activate', ref: save.ref, sample: 'not a sample' },
        ]) {
          expect((await post('act', { input })).value).toMatchObject({ error: 'invalid argument' });
        }
        expect(harness.host.actions.filter((action) => action.type === 'click')).toEqual([]);
      });
    });

    test('refuses an element that is disabled, hidden from a pointer, or covered, and an action the provider lacks', async () => {
      await withFixture({ features: { keyboard: false }, windows: actWindow }, async ({ harness, session }) => {
        const failure = (code: string, reason: string) => ({ code, data: { mutation: rejected(), reason } });
        await expect(session.act({ action: 'activate', ...(await proven(session, 'off')) })).rejects.toMatchObject(
          failure('element not interactable', 'not-enabled'),
        );
        const hidden = await proven(session, 'hidden');
        await expect(session.act({ action: 'click', ...hidden })).rejects.toMatchObject(failure('element not interactable', 'not-visible'));
        const covered = await proven(session, 'covered');
        await expect(session.act({ action: 'click', ...covered })).rejects.toMatchObject(failure('element click intercepted', 'obscured'));
        await expect(session.act({ action: 'type', text: 'x', ...(await proven(session, 'field')) })).rejects.toMatchObject(
          failure('unsupported operation', 'action-unsupported'),
        );
        expect(harness.host.actions.filter((action) => action.type === 'click')).toEqual([]);

        await expect(session.act({ action: 'activate', ...hidden })).resolves.toMatchObject({ result: { mechanism: 'accessibility' } });
        await expect(session.act({ action: 'activate', ...covered })).resolves.toMatchObject({ result: { mechanism: 'accessibility' } });
      });
    });

    test('answers a repeated request id with the first outcome, and refuses the id for a different request', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        const agree = await proven(session, 'agree');
        const first = await session.act({ action: 'activate', ...agree }, { requestId: 'toggle-1' });
        await expect(session.act({ action: 'activate', ...agree }, { requestId: 'toggle-1' })).resolves.toEqual(first);
        expect(harness.host.actions.filter((action) => action.type === 'click')).toHaveLength(1);

        await expect(session.act({ action: 'click', ...agree }, { requestId: 'toggle-1' })).rejects.toMatchObject({
          code: 'invalid argument',
          data: { reason: 'request-id-reused', requestId: 'toggle-1' },
        });

        harness.host.injectFault('click', { effect: 'none', mode: 'reject' });
        const failed = session.act({ action: 'activate', ...agree }, { requestId: 'toggle-2' });
        await expect(failed).rejects.toMatchObject({ data: { mutation: rejected() } });
        // The fault is spent, so running the request again would succeed; the repeat reports the first outcome instead.
        await expect(session.act({ action: 'activate', ...agree }, { requestId: 'toggle-2' })).rejects.toMatchObject({
          data: { mutation: rejected(), requestId: 'toggle-2' },
        });
        expect(harness.host.actions.filter((action) => action.type === 'click')).toHaveLength(1);

        const entries = (await session.journal()).result.entries.filter((entry) => entry.operation === 'act');
        expect(entries.map((entry) => [entry.requestId, entry.outcome, entry.summary?.replay ?? false])).toEqual([
          ['toggle-1', 'ok', false],
          ['toggle-1', 'ok', true],
          ['toggle-1', 'error', false],
          ['toggle-2', 'error', false],
          ['toggle-2', 'error', true],
        ]);
      });
    });

    test('quarantines the target when an action may still land, then refuses actions in fixed words while reads continue', async () => {
      await withFixture({ faults: { click: { mode: 'lost-response' } }, windows: actWindow }, async ({ harness, session }) => {
        const save = await proven(session, 'save');
        const timeouts = harness.server.sessions.get(session.id).desktopTimeouts;
        const previous = timeouts.nativeCommand;
        timeouts.nativeCommand = 10;
        try {
          await expect(session.act({ action: 'activate', ...save })).rejects.toMatchObject({
            code: 'timeout',
            data: { mutation: { disposition: 'indeterminate', quarantined: true } },
          });
        } finally {
          timeouts.nativeCommand = previous;
        }

        const refusal = await session.act({ action: 'activate', ...save }).catch((error: unknown) => error);
        expect(refusal).toMatchObject({ code: 'unknown error', data: { mutation: rejected(true), reason: 'target-quarantined' } });
        expect((refusal as Error).message).not.toMatch(/Activating|reference/);
        await expect(session.find({ automationId: 'save' })).resolves.toMatchObject({ session: { quarantined: true } });
      });
    });

    test('acts on a selector only when a search run now proves it names exactly one element', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, post, session }) => {
        const { result } = await session.act({ action: 'activate', find: { automationId: 'save' } });
        expect(result).toMatchObject({ disposition: 'applied', mechanism: 'accessibility', ref: expect.any(String) });
        // The selector's proof is recorded, so the element can be cited again without another search.
        await expect(session.act({ action: 'activate', ref: result.ref, sample: result.sample })).resolves.toBeDefined();

        const refused = (code: string, reason: string) => ({ code, data: { mutation: rejected(), reason } });
        await expect(session.act({ action: 'activate', find: { name: 'Dup' } })).rejects.toMatchObject(
          refused('invalid argument', 'selector-not-unique'),
        );
        await expect(session.act({ action: 'activate', find: { automationId: 'missing' } })).rejects.toMatchObject(
          refused('no such element', 'no-match'),
        );
        for (const input of [
          { action: 'activate', find: { automationId: 'save' }, ref: result.ref, sample: result.sample },
          { action: 'activate', ref: result.ref },
          { action: 'activate', find: {} },
        ]) {
          expect((await post('act', { input })).value).toMatchObject({ error: 'invalid argument' });
        }
        expect(harness.host.actions.filter((action) => action.type === 'click')).toHaveLength(2);

        await session.act({ action: 'type', find: { automationId: 'field' }, text: 'typed words' });
        expect(JSON.stringify((await session.journal()).result)).not.toMatch(/typed words|"field"/);
      });
    });

    describe('perform', () => {
      const actionWindow = actWindow!.map((window) => ({
        ...window,
        elements: window.elements.map((element) =>
          element.id === 'save' ? { ...element, accessibilityActions: ['AXPress', 'Pin', 'Share', 'Share'] } : element,
        ),
      }));
      const performing = { features: { performAccessibilityAction: true }, windows: actionWindow };

      test('performs the one action an element publishes by a name, as a semantic action', async () => {
        await withFixture(performing, async ({ harness, session }) => {
          await expect(session.act({ action: 'perform', name: 'Pin', ...(await proven(session, 'save')) })).resolves.toMatchObject({
            result: { action: 'perform', disposition: 'applied', mechanism: 'accessibility' },
          });
          await expect(
            session.sequence({ steps: [{ act: { action: 'perform', find: { automationId: 'save' }, name: 'AXPress' } }] }),
          ).resolves.toMatchObject({
            result: { status: 'completed', steps: [{ act: { action: 'perform', mechanism: 'accessibility' } }] },
          });
          expect(
            harness.host.actions
              .filter((action) => action.type === 'accessibility-action')
              .map(({ elementId, name }) => [String(elementId).split('~')[0], name]),
          ).toEqual([
            ['save', 'Pin'],
            ['save', 'AXPress'],
          ]);
          // Action names are application text, so the journal keeps only what kind of action ran.
          const journal = JSON.stringify((await session.journal()).result);
          expect(journal).toContain('"perform"');
          expect(journal).not.toMatch(/Pin|AXPress/);
        });
      });

      test('refuses a name the element does not publish exactly once, and a name without perform', async () => {
        await withFixture(performing, async ({ harness, post, session }) => {
          const save = await proven(session, 'save');
          const refused = (reason: string) => ({ code: 'element not interactable', data: { mutation: rejected(), reason } });
          await expect(session.act({ action: 'perform', name: 'Share', ...save })).rejects.toMatchObject(refused('action-not-unique'));
          await expect(session.act({ action: 'perform', name: 'Missing', ...save })).rejects.toMatchObject(refused('action-not-published'));
          await expect(session.act({ action: 'perform', name: 'Pin', ...(await proven(session, 'off')) })).rejects.toMatchObject(
            refused('not-enabled'),
          );
          for (const input of [
            { action: 'perform', ...save },
            { action: 'activate', name: 'Pin', ...save },
            { action: 'perform', name: '', ...save },
          ]) {
            expect((await post('act', { input })).value).toMatchObject({ error: 'invalid argument' });
          }
          harness.host.injectFault('performAccessibilityAction', { effect: 'none', mode: 'reject' });
          await expect(session.act({ action: 'perform', name: 'Pin', ...save })).rejects.toMatchObject({
            data: { mutation: rejected() },
          });
          expect(harness.host.actions.filter((action) => action.type === 'accessibility-action')).toEqual([]);
        });
      });

      test('is unsupported on a provider that cannot perform named actions', async () => {
        await withFixture({ windows: actionWindow }, async ({ harness, session }) => {
          await expect(session.act({ action: 'perform', name: 'Pin', ...(await proven(session, 'save')) })).rejects.toMatchObject({
            code: 'unsupported operation',
            data: { mutation: rejected(), reason: 'action-unsupported' },
          });
          expect(harness.host.actions.filter((action) => action.type === 'accessibility-action')).toEqual([]);
        });
      });

      test('binds an action key to the exact action the provider listed', async () => {
        await withFixture(performing, async ({ harness }) => {
          const { host } = harness;
          const listed = await host.listAccessibilityActions('save');
          expect(listed.map(({ name }) => name)).toEqual(['AXPress', 'Pin', 'Share', 'Share']);
          expect(new Set(listed.map(({ key }) => key)).size).toBe(4);
          host.setElementActions('save', ['Pin', 'AXPress']);
          await expect(host.performAccessibilityAction('save', listed[1].key)).rejects.toMatchObject({
            code: 'element not interactable',
            data: { reason: 'action-changed' },
          });
          const relisted = await host.listAccessibilityActions('save');
          await host.performAccessibilityAction('save', relisted[0].key);
          expect(host.actions.at(-1)).toEqual({ elementId: 'save', name: 'Pin', type: 'accessibility-action' });
        });
      });
    });
  });

  describe('check', () => {
    test("compares a referenced element's states, name, and value with what is expected, and shows what failed", async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        const agree = await refTo(session, { automationId: 'agree' });
        await expect(session.check({ expect: { checked: false, enabled: true, nameContains: 'AGR' }, ref: agree })).resolves.toMatchObject({
          result: {
            attempts: 1,
            predicates: [
              { expect: 'checked', status: 'passed' },
              { expect: 'enabled', status: 'passed' },
              { expect: 'nameContains', status: 'passed' },
            ],
            status: 'passed',
            window: 'window-1',
          },
        });

        await session.act({ action: 'activate', find: { automationId: 'agree' } });
        const { result } = await session.check({ expect: { checked: false, name: 'Agree' }, ref: agree });
        expect(result).toMatchObject({ status: 'failed' });
        expect(result.predicates).toEqual([
          { actual: true, expect: 'checked', status: 'failed' },
          { expect: 'name', status: 'passed' },
        ]);

        harness.host.setElementStateUnsupported('agree', 'expanded', 'not reported');
        await expect(session.check({ expect: { expanded: false }, ref: agree })).resolves.toMatchObject({
          result: { predicates: [{ expect: 'expanded', status: 'unsupported' }], status: 'unsupported' },
        });

        const field = await refTo(session, { automationId: 'field' });
        await expect(session.check({ expect: { value: '' }, ref: field })).resolves.toMatchObject({ result: { status: 'passed' } });
        await session.act({ action: 'type', find: { automationId: 'field' }, text: 'Hello' });
        await expect(session.check({ expect: { valueContains: 'hELLO' }, ref: field })).resolves.toMatchObject({
          result: { status: 'passed' },
        });
        await expect(session.check({ expect: { value: 'Help' }, ref: field })).resolves.toMatchObject({
          result: { predicates: [{ actual: 'Hello', expect: 'value', status: 'failed' }], status: 'failed' },
        });
        expect(JSON.stringify((await session.journal()).result)).not.toMatch(/Hello|Help|AGR/);
      });
    });

    test('counts what a selector matches, and never calls an incomplete search an absence', async () => {
      await withFixture({ windows: actWindow }, async ({ session }) => {
        await expect(session.check({ find: { name: 'Dup' }, matches: 'some' })).resolves.toMatchObject({
          result: { search: { definite: 2, outcome: 'multiple' }, status: 'passed' },
        });
        await expect(session.check({ find: { name: 'Dup' }, matches: 'unique' })).resolves.toMatchObject({ result: { status: 'failed' } });
        await expect(session.check({ find: { automationId: 'missing' }, matches: 'none' })).resolves.toMatchObject({
          result: { search: { outcome: 'none' }, status: 'passed' },
        });
        const [counted] = (await session.journal()).result.entries.filter((entry) => entry.operation === 'check');
        expect(counted.summary).toEqual({ attempts: 1, by: 'name', matches: 'some', status: 'passed', waitMs: 0 });

        const { result } = await session.check({ expect: { checked: false }, find: { automationId: 'agree' } });
        expect(result).toMatchObject({ ref: expect.any(String), sample: expect.any(String), status: 'passed' });
        await expect(session.act({ action: 'activate', ref: result.ref!, sample: result.sample! })).resolves.toBeDefined();
      });
      await withFixture(
        { observation: { unreadableChildrenOf: ['n'] }, windows: treeWindows({ depth: 1, fanout: 1 }) },
        async ({ session }) => {
          await expect(session.check({ find: { automationId: 'missing' }, matches: 'none' })).resolves.toMatchObject({
            result: { search: { outcome: 'inconclusive', reasons: ['incomplete'] }, status: 'inconclusive' },
          });
        },
      );
    });

    test('passes an absence only once the provider says the element is gone, and stops waiting on a gone element', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        const save = await refTo(session, { automationId: 'save' });
        await expect(session.check({ expect: { present: false }, ref: save })).resolves.toMatchObject({ result: { status: 'failed' } });
        harness.host.removeElement('save');
        await expect(session.check({ expect: { present: false }, ref: save, waitMs: 5_000 })).resolves.toMatchObject({
          result: { attempts: 1, status: 'passed' },
        });

        const off = await refTo(session, { automationId: 'off' });
        harness.host.removeElement('off');
        await expect(session.check({ expect: { enabled: false }, ref: off, waitMs: 5_000 })).resolves.toMatchObject({
          result: { attempts: 1, predicates: [{ actual: false, expect: 'present', status: 'failed' }], status: 'failed' },
        });
      });
    });

    test('waits until the expectation holds, or says the wait ran out and what it last saw', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        setTimeout(() => {
          harness.host.addElement({
            automationId: 'later',
            id: 'later',
            name: 'Later',
            parentId: 'root',
            rect: { height: 30, width: 100, x: 10, y: 400 },
            role: 'button',
            scope: 'preview',
            windowId: 'window-1',
          });
        }, 150);
        const appeared = await session.check({ find: { automationId: 'later' }, matches: 'unique', waitMs: 5_000 });
        expect(appeared.result).toMatchObject({ ref: expect.any(String), status: 'passed' });
        expect(appeared.result.attempts).toBeGreaterThan(1);

        const agree = await refTo(session, { automationId: 'agree' });
        const waited = await session.check({ expect: { checked: true }, ref: agree, waitMs: 250 });
        expect(waited.result).toMatchObject({ last: 'failed', predicates: [{ actual: false, status: 'failed' }], status: 'timed-out' });
        expect(waited.result.attempts).toBeGreaterThan(1);
        expect(waited.result.elapsedMs).toBeGreaterThanOrEqual(250);
      });
    });

    test('refuses displayed content when the operator denies it, and malformed requests', async () => {
      await withFixture(
        { windows: actWindow },
        async ({ post, session }) => {
          const field = await refTo(session, { automationId: 'field' });
          await expect(session.check({ expect: { value: '' }, ref: field })).rejects.toMatchObject(
            operationFailure('unsupported operation', 'content-denied', 'check'),
          );
          await expect(session.check({ expect: { name: 'Field' }, ref: field })).resolves.toMatchObject({ result: { status: 'passed' } });
          for (const input of [
            { expect: { enabled: true }, find: { automationId: 'field' }, ref: field },
            { matches: 'none', ref: field },
            { expect: { present: false }, find: { automationId: 'field' } },
            { expect: { enabled: true, present: false }, ref: field },
            { expect: {}, ref: field },
            { expect: { enabled: true }, ref: field, waitMs: 30_001 },
          ]) {
            expect((await post('check', { input })).value).toMatchObject({ error: 'invalid argument' });
          }
        },
        { operations: { content: 'deny' } },
      );
    });
  });

  describe('sequence', () => {
    const clicks = (harness: { host: { actions: readonly Record<string, unknown>[] } }) =>
      harness.host.actions.filter((action) => action.type === 'click').length;

    test('runs act and check steps in order and closes with an observation', async () => {
      await withFixture({ windows: actWindow }, async ({ session }) => {
        const { result } = await session.sequence({
          observe: { budget: { maxNodes: 20 } },
          steps: [
            { act: { action: 'activate', find: { automationId: 'agree' } } },
            { check: { expect: { checked: true }, find: { automationId: 'agree' } } },
            { act: { action: 'type', find: { automationId: 'field' }, text: 'secret words' } },
            { check: { expect: { valueContains: 'SECRET' }, find: { automationId: 'field' } } },
          ],
        });
        expect(result).toMatchObject({
          status: 'completed',
          steps: [
            { act: { disposition: 'applied', mechanism: 'accessibility' } },
            { check: { status: 'passed' } },
            { act: { disposition: 'applied', mechanism: 'keyboard' } },
            { check: { status: 'passed' } },
          ],
        });
        expect(result.stoppedAt).toBeUndefined();
        expect(result.observation?.outline).toMatch(/checkbox "Agree"/);
        const [entry] = (await session.journal()).result.entries.filter((candidate) => candidate.operation === 'sequence');
        expect(entry.summary).toEqual({ observed: true, status: 'completed', steps: 'activate,check,type,check' });
        expect(JSON.stringify((await session.journal()).result)).not.toMatch(/secret/i);
      });
    });

    test('stops at a check that does not pass or a step that fails, and still observes', async () => {
      await withFixture({ windows: actWindow }, async ({ harness, session }) => {
        const unchecked = await session.sequence({
          observe: {},
          steps: [
            { act: { action: 'activate', find: { automationId: 'save' } } },
            { check: { expect: { checked: true }, find: { automationId: 'agree' } } },
            { act: { action: 'activate', find: { automationId: 'agree' } } },
          ],
        });
        expect(unchecked.result).toMatchObject({
          status: 'stopped',
          stoppedAt: 1,
          steps: [{ act: { disposition: 'applied' } }, { check: { predicates: [{ actual: false }], status: 'failed' } }],
        });
        expect(unchecked.result.steps).toHaveLength(2);
        expect(unchecked.result.observation).toBeDefined();
        expect(clicks(harness)).toBe(1);

        const refused = await session.sequence({ observe: {}, steps: [{ act: { action: 'activate', find: { automationId: 'off' } } }] });
        expect(refused.result).toMatchObject({
          status: 'stopped',
          stoppedAt: 0,
          steps: [{ error: { code: 'element not interactable', mutation: rejected(), reason: 'not-enabled' } }],
        });
        expect(refused.result.observation).toBeDefined();
        expect(clicks(harness)).toBe(1);
      });
    });

    test('refuses the whole request before any step when one step could not run, and replays a repeated request id', async () => {
      await withFixture(
        { windows: actWindow },
        async ({ harness, post, session }) => {
          const save = { act: { action: 'activate', find: { automationId: 'save' } } } as const;
          await expect(
            session.sequence({ steps: [save, { check: { expect: { value: '' }, find: { automationId: 'field' } } }] }),
          ).rejects.toMatchObject(operationFailure('unsupported operation', 'content-denied', 'sequence'));
          await expect(session.sequence({ observe: { view: 'content' }, steps: [save] })).rejects.toMatchObject({
            data: { reason: 'content-denied' },
          });
          expect(clicks(harness)).toBe(0);

          const first = await session.sequence({ steps: [save] }, { requestId: 'twice' });
          await expect(session.sequence({ steps: [save] }, { requestId: 'twice' })).resolves.toEqual(first);
          expect(clicks(harness)).toBe(1);

          const wait = { check: { find: { automationId: 'save' }, matches: 'some', waitMs: 20_000 } };
          for (const input of [{ steps: [] }, { steps: Array(9).fill(save) }, { steps: [wait, wait] }, { steps: [{ observe: {} }] }]) {
            expect((await post('sequence', { input })).value).toMatchObject({ error: 'invalid argument' });
          }
        },
        { operations: { content: 'deny' } },
      );
    });
  });

  describe('capture', () => {
    const png = Uint8Array.from(
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
    );
    const pngBase64 = Buffer.from(png).toString('base64');
    const sha256 = createHash('sha256').update(png).digest('hex');

    test('keeps the window or an element as an artifact with where and when it was taken, and returns pixels only when asked', async () => {
      await withFixture({}, async ({ session }) => {
        const window = await session.capture();
        expect(window.result).toEqual({
          artifact: 'a1',
          bytes: png.byteLength,
          capturedAt: expect.any(String),
          height: 1,
          incarnation: 1,
          mimeType: 'image/png',
          previewGeneration: expect.any(Number),
          scaleFactor: 1,
          scope: 'window',
          sha256,
          width: 1,
          window: expect.any(String),
        });
        expect((await session.capture({ image: true })).result).toMatchObject({ artifact: 'a2', image: pngBase64, scope: 'window' });

        const ref = await refTo(session, { automationId: 'button-primary' });
        expect((await session.capture({ ref })).result).toMatchObject({ artifact: 'a3', ref, scope: 'element', sha256 });
        expect((await session.artifact({ artifact: 'a1' })).result).toEqual({
          artifact: 'a1',
          bytes: png.byteLength,
          data: pngBase64,
          mimeType: 'image/png',
          offset: 0,
          sha256,
        });

        const journal = JSON.stringify((await session.journal()).result);
        expect(journal).toContain('"operation":"capture"');
        expect(journal).toContain('"operation":"artifact"');
        expect(journal).not.toContain(pngBase64);
        expect(journal).not.toContain(sha256);
      });
    });

    test('pages an image too large to return inline, and refuses one too large to keep', async () => {
      const large = Uint8Array.from({ length: 1024 * 1024 + 300 }, (_, index) => index % 251);
      await withFixture({ screenshot: large }, async ({ post, session }) => {
        const { result } = await session.capture({ image: true });
        expect(result).toMatchObject({ bytes: large.byteLength, imageOmitted: 'too-large' });
        expect(result.image).toBeUndefined();

        const first = (await session.artifact({ artifact: result.artifact })).result;
        expect(first).toMatchObject({ next: 1024 * 1024, offset: 0 });
        const second = (await session.artifact({ artifact: result.artifact, offset: first.next })).result;
        expect(second.next).toBeUndefined();
        expect(Buffer.concat([Buffer.from(first.data, 'base64'), Buffer.from(second.data, 'base64')]).equals(Buffer.from(large))).toBe(
          true,
        );
        expect((await session.artifact({ artifact: result.artifact, length: 1024, offset: 1024 })).result).toMatchObject({ next: 2048 });

        await expect(session.artifact({ artifact: result.artifact, offset: large.byteLength + 1 })).rejects.toMatchObject(
          operationFailure('invalid argument', 'offset-out-of-range', 'artifact'),
        );
        for (const input of [{ artifact: 'b1' }, { artifact: 'a0' }, { artifact: 'a1', length: 2 * 1024 * 1024 }]) {
          expect((await post('artifact', { input })).value).toMatchObject({ error: 'invalid argument' });
        }
      });
      await withFixture({ screenshot: new Uint8Array(16 * 1024 * 1024 + 1) }, async ({ session }) => {
        await expect(session.capture()).rejects.toMatchObject(operationFailure('unsupported operation', 'capture-too-large', 'capture'));
      });
    });

    test('drops the oldest captures and says a dropped one expired, not that it never existed', async () => {
      await withFixture({}, async ({ session }) => {
        for (let count = 0; count < 17; count += 1) {
          await session.capture();
        }
        await expect(session.artifact({ artifact: 'a1' })).rejects.toMatchObject(
          operationFailure('invalid argument', 'artifact-expired', 'artifact'),
        );
        await expect(session.artifact({ artifact: 'a18' })).rejects.toMatchObject(
          operationFailure('invalid argument', 'artifact-unknown', 'artifact'),
        );
        await expect(session.artifact({ artifact: 'a2' })).resolves.toMatchObject({ result: { artifact: 'a2' } });
      });
    });

    test('is refused when the operator denies content or the provider cannot capture what was asked for', async () => {
      await withFixture(
        {},
        async ({ session }) => {
          await expect(session.capture()).rejects.toMatchObject(operationFailure('unsupported operation', 'content-denied', 'capture'));
          await expect(session.artifact({ artifact: 'a1' })).rejects.toMatchObject(
            operationFailure('unsupported operation', 'content-denied', 'artifact'),
          );
        },
        { operations: { content: 'deny' } },
      );
      await withFixture({ features: { elementScreenshot: false } }, async ({ session }) => {
        const ref = await refTo(session, { automationId: 'button-primary' });
        await expect(session.capture({ ref })).rejects.toMatchObject(
          operationFailure('unsupported operation', 'element-capture-unsupported', 'capture'),
        );
        await expect(session.capture()).resolves.toMatchObject({ result: { scope: 'window' } });
      });
      await withFixture({ features: { screenshot: false } }, async ({ session }) => {
        expect(await catalogEntry(session, 'capture')).toMatchObject({ available: false, unavailableReason: 'capture-unsupported' });
        await expect(session.capture()).rejects.toMatchObject(operationFailure('unsupported operation', 'capture-unsupported', 'capture'));
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

import { buildSample, supportedFact } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntime, StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import { observeDeltaOperation, observeOperation, observePageOperation } from './observe';
import type { ObserveDeltaResult, ObserveResult } from './observe';

function calculator() {
  return buildSample({
    children: [
      {
        children: [
          { automationId: 'num7', enabled: supportedFact(true), id: 'b7', name: 'Seven', role: 'button' },
          { automationId: 'num8', enabled: supportedFact(false), id: 'b8', name: 'Eight', role: 'button' },
        ],
        id: 'pad',
        name: 'Keypad',
        role: 'group',
      },
      { id: 'display', name: 'Display', role: 'text', text: '1,234', value: '1234' },
      { id: 'entry', name: 'Entry', role: 'textbox', value: 'hunter2' },
    ],
    id: 'win',
    name: 'Calculator',
    role: 'window',
  });
}

function stub(options: StubRuntimeOptions = {}): StubRuntime {
  return stubRuntime({ observation: calculator(), ...options });
}

async function observe(runtime: StubRuntime, input: Record<string, unknown> = {}): Promise<ObserveResult> {
  const response = await executeOperation(runtime.runtime, 'observe', { input });
  return observeOperation.output.parse(response.result) as ObserveResult;
}

async function observeDelta(runtime: StubRuntime, input: Record<string, unknown>): Promise<ObserveDeltaResult> {
  const response = await executeOperation(runtime.runtime, 'observeDelta', { input });
  return observeDeltaOperation.output.parse(response.result) as ObserveDeltaResult;
}

const ref = (runtime: StubRuntime, nativeId: string) => runtime.state.refs.peek(nativeId);

describe('observe', () => {
  test('outlines what can be operated, with the context that places it', async () => {
    const runtime = stub();
    const result = await observe(runtime);
    expect(result.outline.split('\n')).toEqual([
      `window "Calculator" ${ref(runtime, 'win')}`,
      ` group "Keypad" ${ref(runtime, 'pad')}`,
      `  button "Seven" ${ref(runtime, 'b7')} #num7`,
      `  button "Eight" ${ref(runtime, 'b8')} #num8 disabled`,
      ` textbox "Entry" ${ref(runtime, 'entry')}`,
    ]);
    expect(result).toMatchObject({
      budgets: { deadlineMs: 3_000, maxBytes: 12_288, maxDepth: 24, maxNodes: 100, maxStringLength: 120, maxVisited: 1_500 },
      complete: true,
      counts: { emitted: 5, matched: 5, visited: 6 },
      facts: ['checked', 'enabled', 'expanded', 'focused', 'selected'],
      sample: { id: 'o1', root: ref(runtime, 'win'), scope: 'window', window: 'w1' },
      truncation: [],
      unsupportedFacts: [],
      view: 'interactive',
    });
    expect(result.nodes).toBeUndefined();
    expect(result.warnings).toBeUndefined();
  });

  test('shows what is displayed only in the content view', async () => {
    const runtime = stub();
    const result = await observe(runtime, { view: 'content' });
    const lines = result.outline.split('\n');
    expect(lines).toContain(` text "Display" ${ref(runtime, 'display')} value="1234" text="1,234"`);
    expect(lines).toContain(` textbox "Entry" ${ref(runtime, 'entry')} value="hunter2"`);
    expect(result.facts).toEqual(expect.arrayContaining(['text', 'value']));
    expect(runtime.observed[0].facts).toEqual(expect.arrayContaining(['actions', 'text', 'value']));
  });

  test('returns the same elements as nodes when asked', async () => {
    const runtime = stub();
    const result = await observe(runtime, { format: 'nodes' });
    expect(result.outline).toBeUndefined();
    expect(result.nodes?.map(({ depth, ref: reference, role }) => [depth, role, reference])).toEqual([
      [0, 'window', ref(runtime, 'win')],
      [1, 'group', ref(runtime, 'pad')],
      [2, 'button', ref(runtime, 'b7')],
      [2, 'button', ref(runtime, 'b8')],
      [1, 'textbox', ref(runtime, 'entry')],
    ]);
  });

  test('keeps the same references for the same elements across observations', async () => {
    const runtime = stub();
    const first = await observe(runtime);
    const second = await observe(runtime);
    expect(second.outline).toBe(first.outline);
    expect(second.sample.id).toBe('o2');
  });

  test('continues pages from one immutable sample, without asking the provider again', async () => {
    const runtime = stub();
    const first = await observe(runtime, { budget: { maxNodes: 3 } });
    expect(first.complete).toBe(false);
    expect(first.next).toBeDefined();

    const response = await executeOperation(runtime.runtime, 'observePage', {
      input: { budget: { maxNodes: 4 }, cursor: first.next },
    });
    const page = observePageOperation.output.parse(response.result) as ObserveResult;
    expect(page.sample.id).toBe(first.sample.id);
    expect(page.sample.root).toBe(first.sample.root);
    expect(page.complete).toBe(true);
    expect(page.outline).toContain('button "Eight"');
    expect(runtime.observed).toHaveLength(1);
  });

  test('reports added and changed elements against a retained complete sample', async () => {
    const first = buildSample({
      children: [{ id: 'one', name: 'One', role: 'button' }],
      id: 'win',
      role: 'window',
    });
    const second = buildSample({
      children: [
        { id: 'one', name: 'Renamed', role: 'button' },
        { id: 'two', name: 'Two', role: 'button' },
      ],
      id: 'win',
      role: 'window',
    });
    const runtime = stubRuntime({ observe: (_request, _signal, call) => (call === 1 ? first : second) });
    const base = await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id });

    expect(delta).toMatchObject({
      mode: 'delta',
      baseSample: base.sample.id,
      complete: true,
      removalsSuppressed: false,
      counts: { added: 1, changed: 1, removed: 0, emitted: 2, omitted: 0 },
    });
    if (delta.mode !== 'delta') {
      throw new Error('Expected a delta result.');
    }
    expect(delta.changes.map(({ change }) => change)).toEqual(['changed', 'added']);
  });

  test('reports removals only when both retained samples are complete', async () => {
    const first = buildSample({
      children: [{ id: 'gone', name: 'Gone', role: 'button' }],
      id: 'win',
      role: 'window',
    });
    const second = buildSample({ id: 'win', role: 'window' });
    const runtime = stubRuntime({ observe: (_request, _signal, call) => (call === 1 ? first : second) });
    const base = await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id });

    expect(delta).toMatchObject({
      mode: 'delta',
      complete: true,
      removalsSuppressed: false,
      counts: { removed: 1 },
    });
    if (delta.mode !== 'delta') {
      throw new Error('Expected a delta result.');
    }
    expect(delta.changes.map(({ change }) => change)).toEqual(['removed']);
  });

  test('pages through a large delta without re-sampling', async () => {
    const first = buildSample({ id: 'win', role: 'window' });
    const second = buildSample({
      children: [
        { id: 'one', name: 'One', role: 'button' },
        { id: 'two', name: 'Two', role: 'button' },
        { id: 'three', name: 'Three', role: 'button' },
      ],
      id: 'win',
      role: 'window',
    });
    const runtime = stubRuntime({ observe: (_request, _signal, call) => (call === 1 ? first : second) });
    const base = await observe(runtime);
    const firstPage = await observeDelta(runtime, { since: base.sample.id, budget: { maxNodes: 1 } });

    expect(firstPage).toMatchObject({ mode: 'delta', counts: { added: 3, emitted: 1, omitted: 2 } });
    if (firstPage.mode !== 'delta' || !firstPage.next) {
      throw new Error('Expected a paged delta.');
    }
    const response = await executeOperation(runtime.runtime, 'observePage', {
      input: { budget: { maxNodes: 2 }, cursor: firstPage.next },
    });
    const lastPage = observePageOperation.output.parse(response.result);

    expect(lastPage).toMatchObject({ mode: 'delta', complete: true, counts: { emitted: 2, omitted: 0 } });
    expect(runtime.observed).toHaveLength(2);
  });

  test('issues references only to the changes a delta returns', async () => {
    const buttons = Array.from({ length: 40 }, (_, index) => ({ id: `b${index}`, name: `Button ${index}`, role: 'button' }));
    const runtime = stubRuntime({ observation: buildSample({ children: buttons, id: 'win', role: 'window' }) });
    const base = await observe(runtime, { budget: { maxNodes: 3 } });
    const held = runtime.state.refs.size;

    const delta = await observeDelta(runtime, { since: base.sample.id, budget: { maxNodes: 50 } });

    expect(delta).toMatchObject({ mode: 'delta', changes: [], counts: { added: 0, changed: 0, removed: 0 } });
    expect(runtime.state.refs.size).toBe(held);
    expect(delta.mode === 'delta' && delta.sample.root).toBe(ref(runtime, 'win'));
  });

  test('names a removed element by the reference the session holds and issues none for it', async () => {
    const first = buildSample({
      children: [
        { id: 'seen', name: 'Seen', role: 'button' },
        { id: 'unseen', name: 'Unseen', role: 'button' },
      ],
      id: 'win',
      role: 'window',
    });
    const runtime = stubRuntime({
      observe: (_request, _signal, call) => (call === 1 ? first : buildSample({ id: 'win', role: 'window' })),
    });
    const base = await observe(runtime, { budget: { maxNodes: 2 } });
    const held = runtime.state.refs.size;

    const delta = await observeDelta(runtime, { since: base.sample.id });

    if (delta.mode !== 'delta') {
      throw new Error('Expected a delta result.');
    }
    expect(delta.changes).toMatchObject([
      { change: 'removed', element: { name: 'Seen', ref: ref(runtime, 'seen') } },
      { change: 'removed', element: { name: 'Unseen' } },
    ]);
    expect(delta.changes[1].element).not.toHaveProperty('ref');
    expect(runtime.state.refs.size).toBe(held);
  });

  test('returns a fresh snapshot when the projection basis does not match', async () => {
    const runtime = stub();
    const base = await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id, view: 'all' });

    expect(delta).toMatchObject({
      mode: 'fresh',
      reset: { baseSample: base.sample.id, reason: 'basis-mismatch' },
      snapshot: { view: 'all' },
    });
  });

  test('suppresses removals when either sample is incomplete', async () => {
    const first = buildSample({
      children: [{ id: 'gone', name: 'Gone', role: 'button' }],
      id: 'win',
      role: 'window',
    });
    const second = buildSample(
      { id: 'win', role: 'window' },
      { complete: false, truncation: [{ reason: 'visited', limit: 1, unvisited: 1 }] },
    );
    const runtime = stubRuntime({ observe: (_request, _signal, call) => (call === 1 ? first : second) });
    const base = await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id });

    expect(delta).toMatchObject({
      mode: 'delta',
      complete: false,
      removalsSuppressed: true,
      counts: { removed: 0 },
    });
    if (delta.mode !== 'delta') {
      throw new Error('Expected a delta result.');
    }
    expect(delta.changes).toEqual([]);
  });

  test('says which budget left a delta basis incomplete', async () => {
    const buttons = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ id: `b${index}`, name: `Button ${index}`, role: 'button' }));
    const first = buildSample({ children: buttons(5_001), id: 'win', role: 'window' });
    const second = buildSample({ children: buttons(5_002), id: 'win', role: 'window' });
    const runtime = stubRuntime({ observe: (_request, _signal, call) => (call === 1 ? first : second) });
    const base = await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id });

    expect(delta).toMatchObject({ mode: 'delta', complete: false, removalsSuppressed: true });
    expect(delta.mode === 'delta' && delta.truncation).toContainEqual({ limit: 5_000, omitted: 2, reason: 'maxNodes' });
  });

  test('returns an explicit fresh snapshot when the delta base was evicted', async () => {
    const runtime = stub();
    const base = await observe(runtime);
    await observe(runtime);
    await observe(runtime);

    const delta = await observeDelta(runtime, { since: base.sample.id });

    expect(delta).toMatchObject({
      mode: 'fresh',
      reset: { baseSample: base.sample.id, reason: 'base-expired' },
      snapshot: { sample: { id: 'o4' } },
    });
  });

  test('observes inside a reference and roots the sample there', async () => {
    const runtime = stub({
      observe: (request) =>
        request.rootId === 'pad'
          ? buildSample({ children: [{ id: 'b7', name: 'Seven', role: 'button' }], id: 'pad', name: 'Keypad', role: 'group' })
          : calculator(),
    });
    await observe(runtime);
    const result = await observe(runtime, { within: ref(runtime, 'pad') });
    expect(runtime.observed[1]).toMatchObject({ rootId: 'pad', windowId: 'w1' });
    expect(result.outline.split('\n')).toEqual([`group "Keypad" ${ref(runtime, 'pad')}`, ` button "Seven" ${ref(runtime, 'b7')}`]);
    expect(result.sample).toMatchObject({ root: ref(runtime, 'pad'), scope: 'element' });
  });

  test('lists only the shown facts the provider cannot report', async () => {
    const runtime = stubRuntime({ observation: buildSample({ id: 'win', role: 'window' }, { unsupportedFacts: ['help', 'actions'] }) });
    const result = await observe(runtime, { facts: ['help'] });
    expect(result.unsupportedFacts).toEqual(['help']);
  });

  test('keeps the provider deadline inside the native command timeout and reports what applied', async () => {
    const runtime = stub({ nativeTimeoutMs: 5_000 });
    const result = await observe(runtime, { budget: { deadlineMs: 15_000, maxNodes: 3 } });
    expect(runtime.observed[0].budget.deadlineMs).toBe(3_500);
    expect(result.budgets).toMatchObject({ deadlineMs: 3_500, maxNodes: 3 });
  });

  test('says what the provider and the size limits left out', async () => {
    const runtime = stubRuntime({
      observation: buildSample(
        {
          children: [
            { id: 'a', role: 'button' },
            { id: 'b', role: 'button' },
            { id: 'c', role: 'button' },
          ],
          id: 'win',
          role: 'window',
        },
        { truncation: [{ limit: 4, reason: 'visited', unvisited: 7 }] },
      ),
    });
    const result = await observe(runtime, { budget: { maxNodes: 2 } });
    expect(result.complete).toBe(false);
    expect(result.truncation).toEqual([
      { limit: 4, reason: 'visited', unvisited: 7 },
      { limit: 2, omitted: 2, reason: 'maxNodes' },
    ]);
    expect(result.counts.emitted).toBe(2);
  });

  test('warns when evicting an unreferenced cached sample cannot release provider records', async () => {
    const runtime = stubRuntime({
      observe: (_request, _signal, call) =>
        buildSample({
          children: [
            { id: `button${call}`, role: 'button' },
            { id: `label${call}`, role: 'text' },
          ],
          id: `window${call}`,
          role: 'window',
        }),
    });
    runtime.control.releaseError = new Error('the helper went away');
    await observe(runtime);
    await observe(runtime);
    const result = await observe(runtime);
    expect(runtime.state.observations.holds('label1')).toBe(false);
    expect(runtime.released.flat()).toContain('label1');
    expect(result.warnings).toEqual([{ code: 'release-failed', pending: expect.any(Number) }]);
    runtime.control.releaseError = undefined;
    expect((await observe(runtime)).warnings).toBeUndefined();
  });

  describe('content policy', () => {
    test.each([{ view: 'content' }, { facts: ['value'] }, { facts: ['help'] }, { facts: ['text'] }])(
      'refuses to read displayed content when the operator denies it: %j',
      async (input) => {
        const runtime = stub({ contentPolicy: 'deny' });
        await expect(observe(runtime, input)).rejects.toMatchObject({ code: 'unsupported operation', data: { reason: 'content-denied' } });
        expect(runtime.observed).toEqual([]);
      },
    );

    test('still reads names, states, and geometry', async () => {
      const runtime = stub({ contentPolicy: 'deny' });
      const result = await observe(runtime, { facts: ['enabled', 'geometry'] });
      expect(result.outline).toContain('button "Seven"');
    });
  });

  describe('input', () => {
    test.each([
      [{ budget: { maxNodes: 501 } }, 'budget.maxNodes'],
      [{ budget: { maxNodes: 0 } }, 'budget.maxNodes'],
      [{ view: 'everything' }, 'view'],
      [{ facts: ['color'] }, 'facts.0'],
      [{ within: '' }, 'within'],
      [{ extra: true }, 'Unrecognized key'],
    ])('rejects %j', async (input, mentions) => {
      const runtime = stub();
      await expect(observe(runtime, input)).rejects.toMatchObject({
        code: 'invalid argument',
        data: { reason: 'invalid-input' },
        message: expect.stringContaining(mentions),
      });
      expect(runtime.observed).toEqual([]);
    });
  });

  test('is unavailable when the provider cannot observe in a bounded way', async () => {
    const runtime = stub({ capabilities: { boundedObservation: false } });
    await expect(observe(runtime)).rejects.toMatchObject({
      code: 'unsupported operation',
      data: { reason: 'bounded-observation-unsupported' },
    });
    expect(runtime.observed).toEqual([]);
  });
});

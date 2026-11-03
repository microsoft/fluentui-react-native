import { buildSample, supportedFact } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntime, StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import { observeOperation } from './observe';
import type { ObserveResult } from './observe';

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

  test('warns when it could not release provider records, and says nothing otherwise', async () => {
    const runtime = stub();
    runtime.control.releaseError = new Error('the helper went away');
    const result = await observe(runtime);
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

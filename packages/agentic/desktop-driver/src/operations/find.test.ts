import { buildSample } from '../testing/observationSample';
import type { SampleSpec } from '../testing/observationSample';
import { stubRuntime } from '../testing/operationRuntime';
import type { StubRuntime, StubRuntimeOptions } from '../testing/operationRuntime';
import { executeOperation } from './executor';
import { findElementsOperation } from './find';
import type { FindResult } from './find';
import { nativeByteBudget } from './limits';

const save = { automationId: 'save', id: 'save1', name: 'Save', role: 'button' };
const cancel = { automationId: 'cancel', id: 'cancel', name: 'Cancel', role: 'button' };

function settings(extra: SampleSpec[] = []) {
  return buildSample({
    children: [
      { children: [save, cancel], id: 'bar', name: 'Main', role: 'toolbar' },
      {
        children: [
          { automationId: 'saveAdvanced', id: 'save2', name: 'Save', role: 'button' },
          { id: 'log', name: 'Enable logging', role: 'checkbox' },
          { id: 'status', name: 'Status', role: 'text', text: 'Saved 3 files' },
        ],
        id: 'adv',
        name: 'Advanced',
        role: 'group',
      },
      ...extra,
    ],
    id: 'win',
    name: 'Settings',
    role: 'window',
  });
}

function stub(options: StubRuntimeOptions = {}): StubRuntime {
  return stubRuntime({ observation: settings(), ...options });
}

async function find(runtime: StubRuntime, input: Record<string, unknown>): Promise<FindResult> {
  const response = await executeOperation(runtime.runtime, 'find', { input });
  return findElementsOperation.output.parse(response.result) as FindResult;
}

const ref = (runtime: StubRuntime, nativeId: string) => runtime.state.refs.peek(nativeId);

describe('find', () => {
  test('proves a unique match and says where it sits', async () => {
    const runtime = stub();
    const result = await find(runtime, { role: 'checkbox' });
    expect(result).toMatchObject({
      complete: true,
      counts: { definite: 1, possible: 0, visited: 8 },
      matches: [
        {
          match: 'definite',
          name: 'Enable logging',
          path: ['window "Settings"', 'group "Advanced"'],
          ref: ref(runtime, 'log'),
          role: 'checkbox',
        },
      ],
      outcome: 'unique',
      sample: { id: 'o1', scope: 'window', window: 'w1' },
      truncation: [],
    });
    expect(result.reasons).toBeUndefined();
    expect(result.more).toBeUndefined();
    expect(result.warnings).toBeUndefined();
  });

  test('proves there is no match', async () => {
    const result = await find(stub(), { name: 'Delete' });
    expect(result).toMatchObject({ complete: true, counts: { definite: 0, possible: 0 }, matches: [], outcome: 'none' });
  });

  test('tells matches that share a name apart by where they sit', async () => {
    const result = await find(stub(), { name: 'Save' });
    expect(result.outcome).toBe('multiple');
    expect(result.matches.map((match) => [match.automationId, match.path])).toEqual([
      ['save', ['window "Settings"', 'toolbar "Main"']],
      ['saveAdvanced', ['window "Settings"', 'group "Advanced"']],
    ]);
  });

  test('narrows by role, automation id, and displayed text together', async () => {
    const runtime = stub();
    expect((await find(runtime, { automationId: 'saveAdvanced', role: 'button' })).matches.map((match) => match.ref)).toEqual([
      ref(runtime, 'save2'),
    ]);
    expect((await find(runtime, { role: 'text', textContains: 'SAVED' })).matches.map((match) => match.name)).toEqual(['Status']);
    expect((await find(runtime, { role: 'text', text: 'Saved' })).outcome).toBe('none');
  });

  test('reads only the facts its predicates need, with the widest walk the provider accepts', async () => {
    const runtime = stub();
    await find(runtime, { name: 'Save' });
    await find(runtime, { textContains: 'saved' });
    expect(runtime.observed.map((request) => request.facts)).toEqual([[], ['text']]);
    expect(runtime.observed[0].budget).toEqual({
      deadlineMs: 5_000,
      maxBytes: nativeByteBudget(5_000, 256),
      maxDepth: 64,
      maxStringLength: 256,
      maxVisited: 5_000,
    });
  });

  test('keeps references for the matches it returns and releases every other element it read', async () => {
    const runtime = stub();
    await find(runtime, { role: 'checkbox' });
    expect(runtime.state.refs.size).toBe(1);
    expect(runtime.state.refs.holds('log')).toBe(true);
    expect(new Set(runtime.released.flat())).toEqual(new Set(['win', 'bar', 'adv', 'save1', 'cancel', 'save2', 'status']));
  });

  test('returns references that later operations accept', async () => {
    const advanced = () =>
      buildSample({ children: [{ id: 'log', name: 'Enable logging', role: 'checkbox' }], id: 'adv', name: 'Advanced', role: 'group' });
    const runtime = stub({ observe: (request) => (request.rootId === 'adv' ? advanced() : settings()) });
    const group = (await find(runtime, { role: 'group' })).matches[0].ref;
    const response = await executeOperation(runtime.runtime, 'observe', { input: { within: group } });
    expect((response.result as { outline: string }).outline.split('\n')[0]).toBe(`group "Advanced" ${group}`);
  });

  describe('within a reference', () => {
    function toolbar() {
      return buildSample({ children: [save, cancel], id: 'bar', name: 'Main', role: 'toolbar' });
    }

    test('searches inside the element, and the element itself is never a result', async () => {
      const runtime = stub({ observe: (request) => (request.rootId === 'bar' ? toolbar() : settings()) });
      const bar = (await find(runtime, { role: 'toolbar' })).matches[0].ref;

      const inside = await find(runtime, { role: 'button', within: bar });
      expect(inside.sample).toMatchObject({ id: 'o2', scope: 'element', window: 'w1' });
      expect(inside.matches.map((match) => [match.name, match.path])).toEqual([
        ['Save', ['toolbar "Main"']],
        ['Cancel', ['toolbar "Main"']],
      ]);
      expect(runtime.observed[1]).toMatchObject({ rootId: 'bar', windowId: 'w1' });

      expect(await find(runtime, { role: 'toolbar', within: bar })).toMatchObject({ matches: [], outcome: 'none' });
    });
  });

  describe('when the sample cannot prove the answer', () => {
    test('does not call a partial sample with one match unique', async () => {
      const truncation = [{ limit: 4, reason: 'visited' as const, unvisited: 9 }];
      const runtime = stubRuntime({ observation: buildSample({ children: [save], id: 'win', role: 'window' }, { truncation }) });
      const result = await find(runtime, { name: 'Save' });
      expect(result).toMatchObject({ complete: false, outcome: 'inconclusive', reasons: ['incomplete'], truncation });
      expect(result.matches).toHaveLength(1);
    });

    test('still proves several matches from a partial sample', async () => {
      const truncation = [{ reason: 'deadline' as const }];
      const runtime = stubRuntime({
        observation: buildSample({ children: [save, { ...save, id: 'save3' }], id: 'win', role: 'window' }, { truncation }),
      });
      expect(await find(runtime, { name: 'Save' })).toMatchObject({ complete: false, outcome: 'multiple', truncation });
    });

    test('says so when the application cannot report the text searched for', async () => {
      const runtime = stubRuntime({
        observation: buildSample({ children: [save], id: 'win', role: 'window' }, { unsupportedFacts: ['text'] }),
      });
      expect(await find(runtime, { textContains: 'Save' })).toMatchObject({
        counts: { definite: 0, possible: 0 },
        matches: [],
        outcome: 'inconclusive',
        reasons: ['unsupported-fact'],
      });
    });

    test('offers a name cut to its budget as a possible match, after the definite ones', async () => {
      const runtime = stubRuntime({
        observation: buildSample({
          children: [
            { clipped: ['name'], id: 'cut', name: 'Save the docu', role: 'button' },
            { id: 'whole', name: 'Save the document', role: 'button' },
          ],
          id: 'win',
          role: 'window',
        }),
      });
      const result = await find(runtime, { name: 'Save the document' });
      expect(result).toMatchObject({ counts: { definite: 1, possible: 1 }, outcome: 'inconclusive', reasons: ['clipped'] });
      expect(result.matches.map((match) => [match.match, match.name, match.clipped])).toEqual([
        ['definite', 'Save the document', undefined],
        ['possible', 'Save the docu', ['name']],
      ]);
    });
  });

  test('returns at most limit matches and says how many more there were', async () => {
    const buttons = Array.from({ length: 5 }, (_, index) => ({ id: `b${index}`, name: `Button ${index}`, role: 'button' }));
    const runtime = stubRuntime({ observation: buildSample({ children: buttons, id: 'win', role: 'window' }) });
    const result = await find(runtime, { limit: 2, role: 'button' });
    expect(result).toMatchObject({ counts: { definite: 5 }, more: 3, outcome: 'multiple' });
    expect(result.matches.map((match) => match.name)).toEqual(['Button 0', 'Button 1']);
    expect(runtime.state.refs.size).toBe(2);
  });

  describe('what an application displays', () => {
    test('is cut to bounded lengths in matches and in the path that places them', async () => {
      const runtime = stubRuntime({
        observation: buildSample({
          children: [{ children: [{ id: 'deep', name: 'n'.repeat(300), role: 'button' }], id: 'g', name: 'g'.repeat(100), role: 'group' }],
          id: 'win',
          role: 'window',
        }),
      });
      const [match] = (await find(runtime, { role: 'button' })).matches;
      expect(match.name).toBe('n'.repeat(120));
      expect(match.clipped).toEqual(['name']);
      expect(match.path).toEqual([`group "${'g'.repeat(48)}…"`]);
    });

    test('has invisible and direction-changing characters made visible', async () => {
      const runtime = stubRuntime({
        observation: buildSample({ children: [{ id: 'x', name: 'Pay\u202Enow\u0000', role: 'button' }], id: 'win', role: 'window' }),
      });
      const [match] = (await find(runtime, { role: 'button' })).matches;
      expect(match.name).toBe(String.raw`Pay\u202enow\u0000`);
    });
  });

  describe('what a caller may search for', () => {
    test('is refused for displayed text when the operator denies content, without asking the application', async () => {
      const runtime = stub({ contentPolicy: 'deny' });
      for (const input of [{ textContains: 'saved' }, { text: 'Saved 3 files' }]) {
        await expect(find(runtime, input)).rejects.toMatchObject({ code: 'unsupported operation', data: { reason: 'content-denied' } });
      }
      expect(runtime.observed).toEqual([]);
    });

    test('still includes names, roles, and automation ids when content is denied', async () => {
      const runtime = stub({ contentPolicy: 'deny' });
      expect((await find(runtime, { name: 'Save', role: 'button' })).outcome).toBe('multiple');
    });

    test.each([
      [{}, 'Give at least one of role'],
      [{ name: 'a', nameContains: 'b' }, 'Give name or nameContains, not both.'],
      [{ text: 'a', textContains: 'b' }, 'Give text or textContains, not both.'],
      [{ name: '' }, 'name:'],
      [{ name: 'x'.repeat(257) }, 'name:'],
      [{ limit: 0, role: 'button' }, 'limit:'],
      [{ limit: 51, role: 'button' }, 'limit:'],
      [{ budget: { maxVisited: 5_001 }, role: 'button' }, 'budget.maxVisited:'],
      [{ role: 'button', within: '' }, 'within:'],
      [{ extra: 1, role: 'button' }, 'Unrecognized key'],
    ])('rejects %j', async (input, mentions) => {
      const runtime = stub();
      await expect(find(runtime, input)).rejects.toMatchObject({
        code: 'invalid argument',
        data: { reason: 'invalid-input' },
        message: expect.stringContaining(mentions),
      });
      expect(runtime.observed).toEqual([]);
    });

    test('is unavailable when the provider cannot observe in a bounded way', async () => {
      const runtime = stub({ capabilities: { boundedObservation: false } });
      await expect(find(runtime, { role: 'button' })).rejects.toMatchObject({
        code: 'unsupported operation',
        data: { reason: 'bounded-observation-unsupported' },
      });
    });
  });

  describe('the journal', () => {
    test('records which predicates a search used and what it found, never the values searched for', async () => {
      const runtime = stub();
      await find(runtime, { name: 'SECRET-NAME', role: 'button' });
      const { entries } = runtime.state.journal.read({ limit: 10 });
      expect(entries).toMatchObject([
        {
          effect: 'read',
          operation: 'find',
          outcome: 'ok',
          summary: { by: 'name,role', complete: true, definite: 0, outcome: 'none', scoped: false, visited: 8 },
        },
      ]);
      expect(JSON.stringify(entries)).not.toContain('SECRET-NAME');
    });

    test('records a refused search by its code and reason alone', async () => {
      const runtime = stub({ contentPolicy: 'deny' });
      await find(runtime, { textContains: 'SECRET-TEXT' }).catch(() => undefined);
      const { entries } = runtime.state.journal.read({ limit: 10 });
      expect(entries).toMatchObject([
        {
          error: { code: 'unsupported operation', reason: 'content-denied' },
          operation: 'find',
          outcome: 'error',
          summary: { by: 'textContains', scoped: false },
        },
      ]);
      expect(JSON.stringify(entries)).not.toContain('SECRET-TEXT');
    });
  });
});

import type { NativeObservation, NativeObserveBudget, NativeObserveFact, NativeObserveRequest } from '../host/types';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost';
import { createFakeTree, fakeTreeSize } from '../testing/fakeTree';
import type { FakeTreeShape } from '../testing/fakeTree';
import {
  describeObserveRequestViolation,
  describeReleaseViolation,
  maximumElementIdBytes,
  maximumReleasedIds,
  observeBudgetLimits,
  observeFacts,
  parseNativeObservation,
} from './observation';

const budget: NativeObserveBudget = { deadlineMs: 1_000, maxBytes: 65_536, maxDepth: 3, maxStringLength: 32, maxVisited: 10 };
const request: NativeObserveRequest = { budget, facts: ['enabled', 'value'], windowId: 'window-1' };
const enabled = { supported: true, value: true } as const;

function validSample(): NativeObservation {
  return {
    complete: true,
    elapsedMs: 2,
    nodes: [
      { childCount: 2, childrenState: 'complete', depth: 0, enabled, id: 'a', role: 'window', scope: 'application' },
      { childCount: 0, childrenState: 'none', depth: 1, enabled, id: 'b', parentId: 'a', role: 'button', scope: 'preview', value: 'x' },
      { childCount: 0, childrenState: 'none', depth: 1, enabled, id: 'c', parentId: 'a', role: 'button', scope: 'preview' },
    ],
    truncation: [],
    unsupportedFacts: [],
  };
}

function parse(sample: unknown, overrides: Partial<NativeObserveRequest> = {}) {
  return parseNativeObservation({ ...request, ...overrides }, JSON.parse(JSON.stringify(sample)));
}

describe('describeObserveRequestViolation', () => {
  test('accepts a request at the edges of every range', () => {
    const limits = Object.entries(observeBudgetLimits) as [keyof NativeObserveBudget, { max: number; min: number }][];
    for (const bound of ['min', 'max'] as const) {
      const edge = Object.fromEntries(limits.map(([field, limit]) => [field, limit[bound]])) as NativeObserveBudget;
      expect(describeObserveRequestViolation({ ...request, budget: edge })).toBeUndefined();
    }
    expect(describeObserveRequestViolation({ ...request, facts: [...observeFacts], rootId: 'e1' })).toBeUndefined();
  });

  test.each(Object.entries(observeBudgetLimits))('rejects %s outside its range and fractions, without clamping', (field, limit) => {
    for (const value of [limit.min - 1, limit.max + 1, limit.min + 0.5]) {
      expect(describeObserveRequestViolation({ ...request, budget: { ...budget, [field]: value } })).toContain(`budget.${field}`);
    }
  });

  test.each<[string, unknown]>([
    ['an unknown request field', { ...request, cursor: 'x' }],
    ['an unknown budget field', { ...request, budget: { ...budget, maxNodes: 3 } }],
    ['a missing budget field', { ...request, budget: { ...budget, deadlineMs: undefined } }],
    ['an unknown fact', { ...request, facts: ['enabled', 'color'] }],
    ['a repeated fact', { ...request, facts: ['enabled', 'enabled'] }],
    ['an empty window id', { ...request, windowId: '' }],
    ['an empty root id', { ...request, rootId: '' }],
    ['a root id over the byte limit', { ...request, rootId: 'x'.repeat(maximumElementIdBytes + 1) }],
    ['a multibyte root id over the byte limit', { ...request, rootId: 'é'.repeat(maximumElementIdBytes / 2 + 1) }],
    ['a string budget', { ...request, budget: { ...budget, maxVisited: '10' } }],
  ])('rejects %s', (_name, value) => {
    expect(describeObserveRequestViolation(value)).toEqual(expect.any(String));
  });
});

describe('describeReleaseViolation', () => {
  test('accepts a bounded list of distinct ids, including none', () => {
    expect(describeReleaseViolation([])).toBeUndefined();
    expect(describeReleaseViolation(['e1', 'e2'])).toBeUndefined();
    expect(describeReleaseViolation(Array.from({ length: maximumReleasedIds }, (_, index) => `e${index}`))).toBeUndefined();
  });

  test.each<[string, unknown]>([
    ['too many ids', Array.from({ length: maximumReleasedIds + 1 }, (_, index) => `e${index}`)],
    ['repeated ids', ['e1', 'e1']],
    ['an empty id', ['']],
    ['an id over the byte limit', ['x'.repeat(maximumElementIdBytes + 1)]],
    ['a non-array', 'e1'],
  ])('rejects %s', (_name, value) => {
    expect(describeReleaseViolation(value)).toEqual(expect.any(String));
  });
});

describe('parseNativeObservation', () => {
  test('accepts a conforming sample and returns it unchanged', () => {
    expect(parse(validSample())).toEqual({ observation: validSample(), status: 'accepted' });
  });

  test('drops fields the contract does not name instead of passing them through', () => {
    const sample = { ...validSample(), debug: 'x' } as NativeObservation & { debug: string };
    sample.nodes[1] = { ...sample.nodes[1], leaked: 'secret' } as NativeObservation['nodes'][number];

    const parsed = parse(sample);

    expect(parsed.status).toBe('accepted');
    expect(JSON.stringify(parsed)).not.toContain('secret');
    expect(JSON.stringify(parsed)).not.toContain('debug');
  });

  test.each<[string, (sample: NativeObservation) => void, RegExp]>([
    ['a complete flag that contradicts the truncation', (sample) => void (sample.complete = false), /complete must be true exactly when/],
    [
      'a truncated sample reported complete',
      (sample) => void (sample.truncation = [{ limit: 3, reason: 'visited' }]),
      /complete must be true exactly when/,
    ],
    [
      'a repeated truncation reason',
      (sample) => {
        sample.complete = false;
        sample.truncation = [{ reason: 'visited' }, { reason: 'visited' }];
      },
      /appears more than once/,
    ],
    [
      'an empty sample that is not at capacity',
      (sample) => {
        sample.complete = false;
        sample.nodes = [];
        sample.truncation = [{ reason: 'visited' }];
      },
      /empty only when/,
    ],
    [
      'an unsupported fact nobody requested',
      (sample) => void (sample.unsupportedFacts = ['geometry']),
      /"geometry", which was not requested/,
    ],
    ['a root with a parent', (sample) => void (sample.nodes[0].parentId = 'x'), /must be the root/],
    ['a first node that is not at depth 0', (sample) => void (sample.nodes[0].depth = 1), /must be the root/],
    ['a node whose parent is unknown', (sample) => void (sample.nodes[1].parentId = 'zzz'), /earlier node as its parent/],
    ['a node that comes before its parent', (sample) => void sample.nodes.reverse(), /must be the root/],
    ['a repeated id', (sample) => void (sample.nodes[2].id = 'b'), /repeats/],
    ['a depth that does not follow its parent', (sample) => void (sample.nodes[2].depth = 2), /depth 2 under a parent at depth 0/],
    [
      'an order that is not breadth first',
      (sample) => {
        sample.nodes[1] = { ...sample.nodes[1], childCount: 1, childrenState: 'complete' };
        sample.nodes.push({ childCount: 0, childrenState: 'none', depth: 2, id: 'd', parentId: 'b', role: 'text', scope: 'preview' });
        sample.nodes.push({ childCount: 0, childrenState: 'none', depth: 1, id: 'e', parentId: 'a', role: 'button', scope: 'preview' });
        sample.nodes[0].childCount = 3;
      },
      /breaks breadth-first order/,
    ],
    ['a fact nobody requested', (sample) => void (sample.nodes[1].focused = enabled), /carries "focused"/],
    [
      'a fact reported unsupported but present',
      (sample) => {
        sample.unsupportedFacts = ['value'];
        sample.nodes[1].value = 'x';
      },
      /carries "value"/,
    ],
    ['a string over maxStringLength', (sample) => void (sample.nodes[1].name = 'x'.repeat(33)), /longer than 32/],
    [
      'a clipped string cut inside a surrogate pair',
      (sample) => {
        sample.nodes[1].name = `${'x'.repeat(31)}\ud83d`;
        sample.nodes[1].clipped = ['name'];
      },
      /surrogate pair/,
    ],
    ['a clipped marker on a non-string field', (sample) => void (sample.nodes[1].clipped = ['rect']), /not a string field/],
    ['a leaf that reports children', (sample) => void (sample.nodes[0].childrenState = 'none'), /reports no children but has some/],
    [
      'a child count that disagrees with what was emitted',
      (sample) => void (sample.nodes[0].childCount = 5),
      /do not match what was emitted/,
    ],
    [
      'a node reported truncated whose children were all emitted',
      (sample) => {
        sample.complete = false;
        sample.truncation = [{ reason: 'visited' }];
        sample.nodes[0].childrenState = 'truncated';
      },
      /truncated children that were all emitted/,
    ],
    [
      'a node with unread children that has children',
      (sample) => {
        sample.complete = false;
        sample.truncation = [{ reason: 'unreadable' }];
        sample.nodes[0] = { ...sample.nodes[0], childCount: undefined, childrenState: 'unknown' };
      },
      /unread children/,
    ],
    [
      'a truncated node in a sample reported complete',
      (sample) => void (sample.nodes[1] = { ...sample.nodes[1], childCount: 4, childrenState: 'truncated' }),
      /truncated children in a sample reported complete/,
    ],
  ])('rejects %s', (_name, mutate, message) => {
    const sample = validSample();
    mutate(sample);

    expect(parse(sample)).toMatchObject({ message: expect.stringMatching(message), status: 'rejected' });
  });

  test('rejects a sample larger than the visit budget and one deeper than the depth budget', () => {
    expect(parse(validSample(), { budget: { ...budget, maxVisited: 2 } })).toMatchObject({
      message: expect.stringContaining('allows 2'),
      status: 'rejected',
    });
    expect(parse(validSample(), { budget: { ...budget, maxDepth: 0 } })).toMatchObject({
      message: expect.stringContaining('deeper than the budget'),
      status: 'rejected',
    });
  });

  test('accepts an empty sample only when the element table is full', () => {
    const sample: NativeObservation = {
      complete: false,
      elapsedMs: 0,
      nodes: [],
      truncation: [{ reason: 'references', unvisited: 1 }],
      unsupportedFacts: [],
    };

    expect(parse(sample)).toMatchObject({ status: 'accepted' });
  });

  test.each<[string, (sample: Record<string, unknown>) => void, string]>([
    [
      'a node without a children state',
      (sample) => void delete (sample.nodes as Record<string, unknown>[])[0].childrenState,
      'nodes.0.childrenState',
    ],
    ['an unknown scope', (sample) => void ((sample.nodes as Record<string, unknown>[])[0].scope = 'sidebar'), 'nodes.0.scope'],
    ['a fractional depth', (sample) => void ((sample.nodes as Record<string, unknown>[])[0].depth = 0.5), 'nodes.0.depth'],
    ['a missing complete flag', (sample) => void delete sample.complete, 'complete'],
    ['a truncation reason outside the contract', (sample) => void (sample.truncation = [{ reason: 'budget' }]), 'truncation.0.reason'],
    [
      'a supported value without its value',
      (sample) => void ((sample.nodes as Record<string, unknown>[])[0].enabled = { supported: true }),
      'nodes.0.enabled',
    ],
  ])('rejects a malformed shape: %s', (_name, mutate, path) => {
    const sample = JSON.parse(JSON.stringify(validSample())) as Record<string, unknown>;
    mutate(sample);

    expect(parse(sample)).toMatchObject({ message: expect.stringContaining(path), status: 'rejected' });
  });

  test.each([null, 'sample', 3, []])('rejects a response that is not an object: %p', (value) => {
    expect(parse(value)).toMatchObject({ status: 'rejected' });
  });
});

describe('the fake host as a reference provider', () => {
  const shapes: FakeTreeShape[] = [
    { depth: 1, fanout: 1 },
    { depth: 2, fanout: 3 },
    { depth: 3, fanout: 3 },
    { depth: 4, fanout: 2 },
  ];
  const factSets: NativeObserveFact[][] = [[], ['enabled'], [...observeFacts]];

  test.each(shapes)('stays within the contract and reports honest completeness for %j', async (shape) => {
    const host = new FakeDesktopHost({
      endpoint: 'macos',
      features: { accessibilityActions: true, boundedObservation: true },
      windows: [{ elements: createFakeTree(shape), id: 'window-1', title: 'Tree' }],
    });
    const total = fakeTreeSize(shape);

    for (const maxVisited of [1, 2, 7, 50]) {
      for (const maxDepth of [0, 1, 2, 16]) {
        for (const maxBytes of [4_096, 1_048_576]) {
          for (const facts of factSets) {
            const observeRequest: NativeObserveRequest = {
              budget: { ...budget, maxBytes, maxDepth, maxVisited },
              facts,
              windowId: 'window-1',
            };
            const observation = await host.observe(observeRequest);

            expect(parseNativeObservation(observeRequest, JSON.parse(JSON.stringify(observation)))).toMatchObject({ status: 'accepted' });
            expect(await host.observe(observeRequest)).toEqual({ ...observation, elapsedMs: expect.any(Number) });
            if (observation.complete) {
              expect(observation.nodes).toHaveLength(total);
            } else {
              const unresolved = observation.nodes.some((node) => node.childrenState === 'truncated' || node.childrenState === 'unknown');
              expect(unresolved || observation.nodes.length < total).toBe(true);
            }
          }
        }
      }
    }
  });
});

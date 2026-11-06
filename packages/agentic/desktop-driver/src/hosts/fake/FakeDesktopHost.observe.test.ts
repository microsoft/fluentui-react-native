import type {
  NativeElementSnapshot,
  NativeObservation,
  NativeObserveBudget,
  NativeObserveFact,
  NativeObserveRequest,
} from '../../host/types';
import { parseNativeObservation } from '../../protocol/observation';
import { createFakeTree, fakeTreeSize } from '../../testing/fakeTree';
import type { FakeTreeShape } from '../../testing/fakeTree';
import { FakeDesktopHost } from './FakeDesktopHost';
import type { FakeDesktopElement, FakeDesktopHostOptions } from './FakeDesktopHost';

const generousBudget: NativeObserveBudget = {
  deadlineMs: 5_000,
  maxBytes: 1_048_576,
  maxDepth: 16,
  maxStringLength: 256,
  maxVisited: 1_000,
};

function request(
  overrides: { budget?: Partial<NativeObserveBudget>; facts?: NativeObserveFact[]; rootId?: string } = {},
): NativeObserveRequest {
  const { budget, ...rest } = overrides;
  return { facts: [], windowId: 'window-1', ...rest, budget: { ...generousBudget, ...budget } };
}

function createHost(shape: FakeTreeShape | FakeDesktopElement[], options: FakeDesktopHostOptions = {}): FakeDesktopHost {
  return new FakeDesktopHost({
    endpoint: 'macos',
    ...options,
    features: { accessibilityActions: true, boundedObservation: true, ...options.features },
    windows: [{ elements: Array.isArray(shape) ? shape : createFakeTree(shape), id: 'window-1', title: 'Tree' }],
  });
}

/** Observes and asserts the sample is one Node would accept, so every case also checks the validator. */
async function observeConforming(host: FakeDesktopHost, observeRequest: NativeObserveRequest): Promise<NativeObservation> {
  const observation = await host.observe(observeRequest);
  const parsed = parseNativeObservation(observeRequest, JSON.parse(JSON.stringify(observation)));
  expect(parsed).toMatchObject({ status: 'accepted' });
  return observation;
}

function reasons(observation: NativeObservation): string[] {
  return observation.truncation.map((entry) => entry.reason).sort();
}

describe('FakeDesktopHost bounded observation', () => {
  test('is unavailable until the host enables the feature', async () => {
    const host = new FakeDesktopHost({ endpoint: 'macos' });

    await expect(host.observe(request())).rejects.toMatchObject({ name: 'HostUnsupportedError' });
    await expect(host.releaseElements(['root'])).rejects.toMatchObject({ name: 'HostUnsupportedError' });
  });

  test('walks breadth first with parents before children and an honest children state', async () => {
    const host = createHost({ depth: 2, fanout: 2 });

    const observation = await observeConforming(host, request());

    expect(observation.complete).toBe(true);
    expect(observation.truncation).toEqual([]);
    expect(observation.nodes.map((node) => node.id)).toEqual(['n', 'n.0', 'n.1', 'n.0.0', 'n.0.1', 'n.1.0', 'n.1.1']);
    expect(observation.nodes.map((node) => node.depth)).toEqual([0, 1, 1, 2, 2, 2, 2]);
    expect(observation.nodes[0]).toMatchObject({ childCount: 2, childrenState: 'complete', role: 'application', scope: 'application' });
    expect(observation.nodes[0]).not.toHaveProperty('parentId');
    expect(observation.nodes[3]).toMatchObject({ childCount: 0, childrenState: 'none', parentId: 'n.0', role: 'button' });
  });

  test('reports an identical sample for an unchanged tree', async () => {
    const host = createHost({ depth: 3, fanout: 3 });
    const first = await observeConforming(host, request({ budget: { maxVisited: 17 } }));
    const second = await observeConforming(host, request({ budget: { maxVisited: 17 } }));

    expect(second.nodes).toEqual(first.nodes);
  });

  describe('budgets', () => {
    test('stops at maxVisited and marks the frontier truncated instead of failing the tree', async () => {
      const host = createHost({ depth: 3, fanout: 3 });

      const observation = await observeConforming(host, request({ budget: { maxVisited: 6 } }));

      expect(observation.complete).toBe(false);
      expect(observation.nodes.map((node) => node.id)).toEqual(['n', 'n.0', 'n.1', 'n.2', 'n.0.0', 'n.0.1']);
      expect(observation.truncation).toEqual([{ limit: 6, reason: 'visited', unvisited: expect.any(Number) }]);
      expect(observation.truncation[0].unvisited).toBeGreaterThan(0);
      expect(observation.nodes.find((node) => node.id === 'n')).toMatchObject({ childCount: 3, childrenState: 'complete' });
      expect(observation.nodes.find((node) => node.id === 'n.0')).toMatchObject({ childCount: 3, childrenState: 'truncated' });
      expect(observation.nodes.find((node) => node.id === 'n.1')).toMatchObject({ childCount: 3, childrenState: 'truncated' });
    });

    test('stops at maxDepth and leaves the cut nodes truncated rather than leaves', async () => {
      const host = createHost({ depth: 3, fanout: 2 });

      const observation = await observeConforming(host, request({ budget: { maxDepth: 1 } }));

      expect(reasons(observation)).toEqual(['depth']);
      expect(observation.truncation[0]).toMatchObject({ limit: 1, unvisited: 4 });
      expect(observation.nodes.map((node) => node.depth)).toEqual([0, 1, 1]);
      expect(observation.nodes[1]).toMatchObject({ childCount: 2, childrenState: 'truncated' });
    });

    test('allows a zero depth budget to read only the root', async () => {
      const host = createHost({ depth: 2, fanout: 2 });

      const observation = await observeConforming(host, request({ budget: { maxDepth: 0 } }));

      expect(observation.nodes).toHaveLength(1);
      expect(observation.nodes[0]).toMatchObject({ childCount: 2, childrenState: 'truncated' });
    });

    test('stops at maxBytes and never exceeds it after the root', async () => {
      const host = createHost({ depth: 3, fanout: 7 });
      const facts: NativeObserveFact[] = ['enabled', 'focused', 'geometry', 'selected', 'visible'];

      const observation = await observeConforming(host, request({ budget: { maxBytes: 4_096 }, facts }));

      expect(reasons(observation)).toEqual(['bytes']);
      expect(observation.nodes.length).toBeGreaterThan(1);
      expect(observation.nodes.length).toBeLessThan(fakeTreeSize({ depth: 3, fanout: 7 }));
      const emitted = observation.nodes.reduce((total, node) => total + Buffer.byteLength(JSON.stringify(node)), 0);
      expect(emitted).toBeLessThanOrEqual(4_096);
    });

    test('stops at the deadline when the provider is slow and reports what it had read', async () => {
      const host = createHost({ depth: 2, fanout: 5 }, { observation: { readDelayMs: 15 } });

      const observation = await observeConforming(host, request({ budget: { deadlineMs: 50 } }));

      expect(reasons(observation)).toEqual(['deadline']);
      expect(observation.nodes.length).toBeGreaterThanOrEqual(1);
      expect(observation.nodes.length).toBeLessThan(fakeTreeSize({ depth: 2, fanout: 5 }));
    });

    test('always reads the root, even when the budgets leave no room after it', async () => {
      const host = createHost({ depth: 2, fanout: 2 }, { observation: { readDelayMs: 5 } });

      const observation = await observeConforming(host, request({ budget: { deadlineMs: 50, maxBytes: 4_096, maxVisited: 1 } }));

      expect(observation.nodes.map((node) => node.id)).toEqual(['n']);
      expect(reasons(observation)).toEqual(['visited']);
    });

    test('clips long strings to maxStringLength and says which fields it cut', async () => {
      const long = 'x'.repeat(100);
      const host = createHost([
        {
          automationId: 'root',
          id: 'a',
          name: long,
          rect: { height: 1, width: 1, x: 0, y: 0 },
          role: 'window',
          scope: 'application',
          text: long,
          value: long,
          windowId: 'window-1',
        },
      ]);

      const observation = await observeConforming(host, request({ budget: { maxStringLength: 16 }, facts: ['text', 'value'] }));

      expect(observation.nodes[0]).toMatchObject({
        clipped: ['name', 'value', 'text'],
        name: 'x'.repeat(16),
        text: 'x'.repeat(16),
        value: 'x'.repeat(16),
      });
      expect(observation.nodes[0].automationId).toBe('root');
    });

    test('never cuts a surrogate pair in half', async () => {
      const host = createHost([
        {
          id: 'a',
          name: `${'x'.repeat(15)}😀 and more`,
          rect: { height: 1, width: 1, x: 0, y: 0 },
          role: 'window',
          scope: 'application',
          windowId: 'window-1',
        },
      ]);

      const observation = await observeConforming(host, request({ budget: { maxStringLength: 16 } }));

      expect(observation.nodes[0]).toMatchObject({ clipped: ['name'], name: 'x'.repeat(15) });
    });
  });

  describe('facts', () => {
    test('reports only what the request names', async () => {
      const host = createHost({ depth: 1, fanout: 1 });

      const bare = await observeConforming(host, request());
      const detailed = await observeConforming(host, request({ facts: ['enabled', 'geometry'] }));

      expect(Object.keys(bare.nodes[1]).sort()).toEqual([
        'automationId',
        'childCount',
        'childrenState',
        'depth',
        'id',
        'name',
        'parentId',
        'role',
        'scope',
      ]);
      expect(detailed.nodes[1]).toMatchObject({ enabled: { supported: true, value: true }, rect: { height: 20, width: 100, x: 0, y: 20 } });
      expect(detailed.nodes[1]).not.toHaveProperty('focused');
    });

    test('keeps a requested fact an element cannot report distinct from one nobody asked for', async () => {
      const host = createHost({ depth: 1, fanout: 1 });

      const observation = await observeConforming(host, request({ facts: ['help', 'required'] }));

      expect(observation.nodes[1].required).toEqual({ reason: expect.any(String), supported: false });
      expect(observation.nodes[1].helpText).toEqual({ reason: expect.any(String), supported: false });
      expect(observation.unsupportedFacts).toEqual([]);
    });

    test('lists a fact the platform cannot report once, not on every node', async () => {
      const host = createHost({ depth: 1, fanout: 2 }, { features: { accessibilityActions: false } });

      const observation = await observeConforming(host, request({ facts: ['actions', 'enabled'] }));

      expect(observation.unsupportedFacts).toEqual(['actions']);
      expect(observation.nodes.every((node) => !('actions' in node))).toBe(true);
      expect(observation.nodes[0]).toHaveProperty('enabled');
    });

    test('reports accessibility actions, empty when the element publishes none', async () => {
      const host = createHost([
        { id: 'a', rect: { height: 1, width: 1, x: 0, y: 0 }, role: 'window', scope: 'application', windowId: 'window-1' },
        {
          accessibilityActions: ['Press', 'Toggle'],
          id: 'b',
          parentId: 'a',
          rect: { height: 1, width: 1, x: 0, y: 0 },
          role: 'button',
          scope: 'preview',
          windowId: 'window-1',
        },
      ]);

      const observation = await observeConforming(host, request({ facts: ['actions'] }));

      expect(observation.nodes.map((node) => node.actions)).toEqual([[], ['Press', 'Toggle']]);
    });

    test('never reports the value or text of a secure field', async () => {
      const host = createHost([
        { id: 'a', rect: { height: 1, width: 1, x: 0, y: 0 }, role: 'window', scope: 'application', windowId: 'window-1' },
        {
          id: 'password',
          name: 'Password',
          parentId: 'a',
          rect: { height: 1, width: 1, x: 0, y: 0 },
          role: 'textbox',
          scope: 'preview',
          secure: true,
          text: 'hunter2',
          value: 'hunter2',
          windowId: 'window-1',
        },
      ]);

      const observation = await observeConforming(host, request({ facts: ['text', 'value'] }));

      expect(JSON.stringify(observation)).not.toContain('hunter2');
      expect(observation.nodes[1]).toMatchObject({ name: 'Password' });
    });
  });

  describe('children that cannot be read', () => {
    test('marks them unknown rather than reporting a leaf', async () => {
      const host = createHost({ depth: 2, fanout: 2 }, { observation: { unreadableChildrenOf: ['n.0'] } });

      const observation = await observeConforming(host, request());

      expect(reasons(observation)).toEqual(['unreadable']);
      expect(observation.nodes.find((node) => node.id === 'n.0')).toMatchObject({ childrenState: 'unknown' });
      expect(observation.nodes.find((node) => node.id === 'n.0')).not.toHaveProperty('childCount');
      expect(observation.nodes.find((node) => node.id === 'n.1')).toMatchObject({ childrenState: 'complete' });
    });
  });

  describe('rooted samples', () => {
    test('starts at the root and keeps its scope, with ids shared with the full sample', async () => {
      const host = createHost({ depth: 2, fanout: 2 });
      const full = await observeConforming(host, request());

      const rooted = await observeConforming(host, request({ rootId: 'n.1' }));

      expect(rooted.nodes.map((node) => node.id)).toEqual(['n.1', 'n.1.0', 'n.1.1']);
      expect(rooted.nodes[0]).toMatchObject({ depth: 0, scope: 'preview' });
      expect(rooted.nodes[0]).not.toHaveProperty('parentId');
      expect(rooted.nodes[1]).toMatchObject({ depth: 1, parentId: 'n.1' });
      expect(rooted.nodes.map((node) => node.name)).toEqual(
        full.nodes.filter((node) => node.id.startsWith('n.1')).map((node) => node.name),
      );
    });

    test('rejects a root that is unknown, released, or in another window as stale', async () => {
      const host = createHost({ depth: 1, fanout: 1 });

      await expect(host.observe(request({ rootId: 'missing' }))).rejects.toMatchObject({ name: 'HostStaleError' });
      await host.observe(request());
      await host.releaseElements(['n.0']);
      await expect(host.observe(request({ rootId: 'n.0' }))).rejects.toMatchObject({ name: 'HostStaleError' });
      await expect(host.observe({ ...request(), windowId: 'missing-window' })).rejects.toMatchObject({ name: 'HostStaleError' });
    });
  });

  describe('identity', () => {
    test('never reuses a released id and issues a fresh one when the element is observed again', async () => {
      const host = createHost({ depth: 1, fanout: 2 });
      const before = await observeConforming(host, request());

      await expect(host.releaseElements(['n.0'])).resolves.toBe(1);
      const after = await observeConforming(host, request());

      expect(after.nodes.map((node) => node.name)).toEqual(before.nodes.map((node) => node.name));
      const reissued = after.nodes.find((node) => node.name === 'Name n.0');
      expect(reissued.id).not.toBe('n.0');
      expect(after.nodes.find((node) => node.name === 'Name n.1').id).toBe('n.1');
      await expect(host.snapshot('n.0')).rejects.toMatchObject({ name: 'HostStaleError' });
      await expect(host.snapshot(reissued.id)).resolves.toMatchObject({ name: 'Name n.0' });

      await host.releaseElements([reissued.id]);
      const again = await host.observe(request());
      const ids = [before, after, again].flatMap((sample) =>
        sample.nodes.filter((node) => node.name === 'Name n.0').map((node) => node.id),
      );
      expect(new Set(ids).size).toBe(3);
    });

    test('is idempotent and ignores ids it does not track', async () => {
      const host = createHost({ depth: 1, fanout: 1 });
      await host.observe(request());

      await expect(host.releaseElements(['n.0', 'never-issued'])).resolves.toBe(1);
      await expect(host.releaseElements(['n.0'])).resolves.toBe(0);
      await expect(host.releaseElements([])).resolves.toBe(0);
    });

    test('shares one id registry with find, snapshot, and tree so releasing an observed id stales them all', async () => {
      const host = createHost({ depth: 1, fanout: 2 });
      const [found] = await host.find({ windowId: 'window-1' }, { strategy: 'accessibility id', value: 'auto-n.0' });
      const observed = await host.observe(request());
      expect(observed.nodes.find((node) => node.name === 'Name n.0').id).toBe(found.id);

      await host.releaseElements([found.id]);

      await expect(host.snapshot(found.id)).rejects.toMatchObject({ name: 'HostStaleError' });
      const [refound] = await host.find({ windowId: 'window-1' }, { strategy: 'accessibility id', value: 'auto-n.0' });
      expect(refound.id).not.toBe(found.id);
      const tree = await host.tree('window-1');
      expect(tree.find((element: NativeElementSnapshot) => element.name === 'Name n.0').id).toBe(refound.id);
    });

    test('treats an element that leaves and returns as a new element', async () => {
      const host = createHost({ depth: 1, fanout: 1 });
      const [before] = await host.find({ windowId: 'window-1' }, { strategy: 'accessibility id', value: 'auto-n.0' });

      host.removeElement('n.0');
      await expect(host.snapshot(before.id)).rejects.toMatchObject({ name: 'HostStaleError' });
      host.addElement(createFakeTree({ depth: 1, fanout: 1 })[1]);

      const [after] = await host.find({ windowId: 'window-1' }, { strategy: 'accessibility id', value: 'auto-n.0' });
      expect(after.id).not.toBe(before.id);
      await expect(host.snapshot(before.id)).rejects.toMatchObject({ name: 'HostStaleError' });
    });

    test('stops with references instead of evicting when the element table is full', async () => {
      const host = createHost({ depth: 2, fanout: 3 }, { observation: { maxElementRecords: 5 } });

      const first = await observeConforming(host, request());

      expect(first.nodes).toHaveLength(5);
      expect(reasons(first)).toEqual(['references']);
      expect(host.trackedElementCount).toBe(5);
      const second = await observeConforming(host, request());
      expect(second.nodes.map((node) => node.id)).toEqual(first.nodes.map((node) => node.id));

      await host.releaseElements([first.nodes[4].id]);
      const third = await observeConforming(host, request());
      expect(third.nodes).toHaveLength(5);
      expect(third.nodes[4].id).not.toBe(first.nodes[4].id);
    });

    test('reports an empty sample when the table has no room even for the root', async () => {
      const host = createHost({ depth: 1, fanout: 1 }, { observation: { maxElementRecords: 1 } });
      // A snapshot also registers its parent, so release the root to leave the table full of other elements.
      await host.find({ windowId: 'window-1' }, { strategy: 'accessibility id', value: 'auto-n.0' });
      await host.releaseElements(['n']);

      const observation = await observeConforming(host, request());

      expect(observation.nodes).toEqual([]);
      expect(observation.truncation).toEqual([{ reason: 'references', unvisited: 1 }]);
    });
  });

  describe('failures', () => {
    test('rejects a request that breaks the contract before reading anything', async () => {
      const host = createHost({ depth: 1, fanout: 1 });

      await expect(host.observe(request({ budget: { maxVisited: 0 } }))).rejects.toMatchObject({ code: 'invalid argument' });
      await expect(host.observe(request({ facts: ['enabled', 'enabled'] }))).rejects.toMatchObject({ code: 'invalid argument' });
      await expect(host.releaseElements(['a', 'a'])).rejects.toMatchObject({ code: 'invalid argument' });
    });

    test('unwinds a slow read when the caller aborts and keeps working afterwards', async () => {
      const host = createHost({ depth: 2, fanout: 3 }, { observation: { readDelayMs: 25 } });
      const controller = new AbortController();

      const pending = host.observe(request(), controller.signal);
      setTimeout(() => controller.abort(new Error('stop')), 40);

      await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
      await expect(host.observe(request({ budget: { maxVisited: 1 } }))).resolves.toMatchObject({ nodes: [{ id: 'n' }] });
    });
  });
});

import { buildSample } from '../testing/observationSample';
import type { ObservationSnapshot } from './observations';
import { ObservationStore } from './observations';

function snapshot(id: number, prefix: string, count: number): ObservationSnapshot {
  return {
    observation: buildSample({
      children: Array.from({ length: count }, (_, index) => ({ id: `${prefix}${index}`, role: 'button' })),
      id: `${prefix}root`,
      role: 'window',
    }),
    projection: {
      deadlineMs: 3_000,
      facts: [],
      format: 'outline',
      maxBytes: 12_288,
      maxDepth: 24,
      maxNodes: 100,
      maxStringLength: 120,
      maxVisited: 5_000,
      shown: [],
      view: 'all',
    },
    sample: {
      capturedAt: '2026-01-01T00:00:00.000Z',
      elapsedMs: 1,
      epoch: { incarnation: 1, region: 1 },
      id: `o${id}`,
      scope: 'window',
      window: 'w1',
    },
    scopeKey: 'same-scope',
    windowId: 'w1',
  };
}

describe('ObservationStore', () => {
  test('bounds retained native identities and preserves a pinned delta base', () => {
    const store = new ObservationStore();
    const first = snapshot(1, 'a', 5_000);
    const second = snapshot(2, 'b', 5_000);

    expect(store.add(first).stored).toBe(true);
    expect(store.add(second, ['o1'])).toMatchObject({ stored: false, evicted: [] });
    expect(store.get('o1')).toBeDefined();
    expect(store.holds('a4999')).toBe(true);
    expect(store.holds('b4999')).toBe(false);
    expect(store.add(second).stored).toBe(true);
    expect(store.holds('a4999')).toBe(false);
    expect(store.holds('b4999')).toBe(true);
  });

  test('accepts only cursors signed by this session store', () => {
    const store = new ObservationStore();
    const cursor = store.cursor({ kind: 'snapshot', offset: 4, sampleId: 'o2' });

    expect(store.readCursor(cursor)).toEqual({ kind: 'snapshot', offset: 4, sampleId: 'o2' });
    expect(store.readCursor(`${cursor}x`)).toBeUndefined();
    expect(new ObservationStore().readCursor(cursor)).toBeUndefined();
  });
});

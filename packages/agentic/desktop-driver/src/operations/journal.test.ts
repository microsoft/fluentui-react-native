import { OperationJournal } from './journal';
import type { JournalRecord } from './journal';

function record(overrides: Partial<JournalRecord> = {}): JournalRecord {
  return {
    at: '2026-01-01T00:00:00.000Z',
    durationMs: 12.4,
    effect: 'read',
    operation: 'observe',
    outcome: 'ok',
    requestId: 'r1',
    ...overrides,
  };
}

describe('OperationJournal', () => {
  test('numbers entries and pages them by cursor', () => {
    const journal = new OperationJournal(10);
    for (let index = 0; index < 5; index += 1) {
      journal.record(record({ requestId: `r${index}` }));
    }

    const first = journal.read({ limit: 2 });
    expect(first.entries.map((entry) => entry.sequence)).toEqual([1, 2]);
    expect(first.next).toBe(2);
    const second = journal.read({ after: first.next, limit: 10 });
    expect(second.entries.map((entry) => entry.sequence)).toEqual([3, 4, 5]);
    expect(second.next).toBeUndefined();
    expect(second.dropped).toBe(0);
  });

  test('drops the oldest entries at capacity and reports them to a reader that fell behind', () => {
    const journal = new OperationJournal(3);
    for (let index = 0; index < 7; index += 1) {
      journal.record(record());
    }

    expect(journal.size).toBe(3);
    const page = journal.read({ after: 2, limit: 10 });
    expect(page.entries.map((entry) => entry.sequence)).toEqual([5, 6, 7]);
    expect(page.dropped).toBe(2);
    expect(journal.read({ after: 4, limit: 10 }).dropped).toBe(0);
  });

  test('keeps only allowlisted scalar summary fields and strips control characters', () => {
    const journal = new OperationJournal();
    const entry = journal.record(
      record({
        summary: {
          count: 3,
          label: 'a\nb\u0007c',
          nested: { secret: 'x' },
          'bad key': 'x',
          Upper: 'x',
          ok: true,
          unlimited: Number.POSITIVE_INFINITY,
        },
      }),
    );

    expect(entry.summary).toEqual({ count: 3, label: 'a b c', ok: true, unlimited: null });
  });

  test('bounds the number and length of summary fields', () => {
    const journal = new OperationJournal();
    const summary = Object.fromEntries(Array.from({ length: 40 }, (_unused, index) => [`k${index}`, 'x'.repeat(200)]));
    const entry = journal.record(record({ summary }));

    expect(Object.keys(entry.summary ?? {})).toHaveLength(16);
    expect(Object.values(entry.summary ?? {}).every((value) => typeof value === 'string' && value.length === 80)).toBe(true);
  });

  test('records an error code and machine reason but never a message', () => {
    const journal = new OperationJournal();
    const entry = journal.record(
      record({
        error: { code: 'stale element reference', reason: 'ref-expired' },
        outcome: 'error',
        summary: undefined,
      }),
    );
    const leaky = journal.record(
      record({
        error: { code: 'No element named "Password"', reason: 'Quoted "Secret Text"' },
        outcome: 'error',
      }),
    );

    expect(entry.error).toEqual({ code: 'stale element reference', reason: 'ref-expired' });
    expect(leaky.error).toEqual({ code: 'unknown error' });
    expect(JSON.stringify(journal.read({ limit: 10 }))).not.toMatch(/Password|Secret/);
  });

  test('rounds durations and clamps them to zero', () => {
    const journal = new OperationJournal();

    expect(journal.record(record({ durationMs: 12.6 })).durationMs).toBe(13);
    expect(journal.record(record({ durationMs: -5 })).durationMs).toBe(0);
  });
});

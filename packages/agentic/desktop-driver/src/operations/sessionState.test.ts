import { parseReference } from './refs';
import { OperationSessionState } from './sessionState';

const target = { nativeId: 'n1', previewGeneration: 1, scope: 'application' as const, windowId: 'w1' };

describe('OperationSessionState', () => {
  test('counts request ids and sample numbers from 1, independently', () => {
    const state = new OperationSessionState();
    expect([state.nextRequestId(), state.nextRequestId()]).toEqual(['r1', 'r2']);
    expect([state.nextSample(), state.nextSample(), state.nextSample()]).toEqual([1, 2, 3]);
    expect(state.nextRequestId()).toBe('r3');
  });

  test('gives every session its own reference tag, so a reference never resolves in another session', () => {
    const sessions = Array.from({ length: 64 }, () => new OperationSessionState());
    const references = sessions.map((state) => state.refs.issue(target, 1));
    expect(new Set(references.map((reference) => parseReference(reference)?.tag)).size).toBe(sessions.length);
    expect(sessions[1].refs.resolve(references[0], 1)).toEqual({ failure: 'foreign', ok: false });
    expect(sessions[0].refs.resolve(references[0], 1)).toMatchObject({ ok: true });
  });

  test('keeps the release ledger from queueing an element a reference still retains', () => {
    const state = new OperationSessionState();
    state.refs.issue(target, 1);
    state.ledger.queue(['n1', 'n2']);
    expect(state.ledger.pendingCount).toBe(1);
  });

  describe('a new application incarnation', () => {
    test('counts incarnations and reports earlier references as earlier, not as foreign or unknown', () => {
      const state = new OperationSessionState();
      const before = state.refs.issue(target, 1);
      expect(state.incarnation).toBe(1);
      state.startIncarnation();
      expect(state.incarnation).toBe(2);
      expect(state.refs.resolve(before, 1)).toEqual({ failure: 'earlier-incarnation', ok: false });
      expect(state.refs.size).toBe(0);
    });

    test('issues references under a new tag, in the same table', () => {
      const state = new OperationSessionState();
      const before = state.refs.issue(target, 1);
      state.startIncarnation();
      const after = state.refs.issue(target, 2);
      expect(parseReference(after)?.tag).not.toBe(parseReference(before)?.tag);
      expect(state.refs.resolve(after, 1)).toMatchObject({ ok: true });
    });

    test('forgets what was waiting to be released, because the provider lost those records with the application', () => {
      const state = new OperationSessionState();
      state.ledger.queue(['n1', 'n2']);
      state.ledger.markExternal('n3');
      state.startIncarnation();
      expect(state.ledger.pendingCount).toBe(0);
      expect(state.ledger.isExternal('n3')).toBe(false);
    });

    test('keeps the journal and the sample and request counters running', () => {
      const state = new OperationSessionState();
      state.nextSample();
      state.nextRequestId();
      state.journal.record({
        at: '2026-01-01T00:00:00.000Z',
        durationMs: 1,
        effect: 'read',
        operation: 'observe',
        outcome: 'ok',
        requestId: 'r1',
      });
      state.startIncarnation();
      expect(state.nextSample()).toBe(2);
      expect(state.nextRequestId()).toBe('r2');
      expect(state.journal.size).toBe(1);
    });
  });

  test('sizes its tables from the options', () => {
    const state = new OperationSessionState({ journalCapacity: 16, referenceCapacity: 512 });
    for (let index = 0; index < 20; index += 1) {
      state.journal.record({
        at: '2026-01-01T00:00:00.000Z',
        durationMs: 1,
        effect: 'read',
        operation: 'observe',
        outcome: 'ok',
        requestId: `r${index}`,
      });
    }
    expect(state.journal.size).toBe(16);
  });
});

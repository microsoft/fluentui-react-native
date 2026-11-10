import { includeDesktopEvent, projectDesktopEvent } from './structured.js';
import type { CollectedDesktopEvent } from './protocol.js';

describe('structured desktop events', () => {
  test('milestones suppress passing tests while progress retains test results', () => {
    const event = makeEvent({
      kind: 'test-result',
      payload: { testId: 'test', title: 'passing test', attempt: 0, status: 'passed', durationMs: 1 },
    });

    expect(includeDesktopEvent(event, 'milestones')).toBe(false);
    expect(includeDesktopEvent(event, 'progress')).toBe(true);
    expect(includeDesktopEvent(event, 'all')).toBe(true);
  });

  test('milestones omit worker scopes but include service scopes', () => {
    const event = makeEvent({ kind: 'scope-end', payload: { status: 'passed' } });

    expect(includeDesktopEvent(event, 'milestones', 'worker')).toBe(false);
    expect(includeDesktopEvent(event, 'milestones', 'service')).toBe(true);
  });

  test('a scope end projects its summary only when there is one', () => {
    const summarized = makeEvent({ kind: 'scope-end', payload: { status: 'passed', summary: '30 of 101 story tests executed' } });
    const plain = makeEvent({ kind: 'scope-end', payload: { status: 'passed', summary: '' } });

    expect(projectDesktopEvent(summarized).payload).toEqual({ status: 'passed', summary: '30 of 101 story tests executed' });
    expect(projectDesktopEvent(plain).payload).toEqual({ status: 'passed' });
  });

  test('exclusion counts are progress detail and project as plain numbers', () => {
    const event = makeEvent({ kind: 'selection', payload: { excluded: { platform: 1, scope: 0, input: 2 } } });

    expect(includeDesktopEvent(event, 'milestones')).toBe(false);
    expect(includeDesktopEvent(event, 'progress')).toBe(true);
    expect(projectDesktopEvent(event).payload).toEqual({ excluded: { platform: 1, scope: 0, input: 2 } });
  });

  test('a declared gap stays visible at every level and projects with its reason', () => {
    const event = makeEvent({
      kind: 'test-result',
      payload: { testId: 'test', title: 'gap', attempt: 0, status: 'unsupported', durationMs: 0, reason: 'Declared.', gap: 'quarantine' },
    });

    expect(includeDesktopEvent(event, 'milestones')).toBe(true);
    expect(projectDesktopEvent(event).payload).toMatchObject({ status: 'unsupported', gap: 'quarantine', reason: 'Declared.' });
  });

  test('projects and bounds large event text while retaining canonical IDs', () => {
    const event = makeEvent({
      kind: 'output',
      payload: { stream: 'stdout', text: 'x'.repeat(1024 * 1024) },
    });
    const record = projectDesktopEvent(event);

    expect(record.eventId).toBe(event.eventId);
    expect(record.payload.text).toContain('[truncated]');
    expect(Buffer.byteLength(JSON.stringify(record))).toBeLessThan(4 * 1024);
  });

  test('keeps identifiers whole while shrinking free text to fit the record limit', () => {
    const testId = 'test-'.repeat(120);
    const event = makeEvent({
      kind: 'test-result',
      payload: {
        testId,
        title: 'title '.repeat(2_000),
        attempt: 0,
        status: 'failed',
        durationMs: 1,
        failure: { failureId: 'f'.repeat(400), kind: 'test', error: { name: 'Error', message: 'message '.repeat(2_000) } },
      },
    });
    const record = projectDesktopEvent(event);

    expect(record.payload.testId).toBe(testId);
    expect((record.payload.failure as { failureId: string }).failureId).toBe('f'.repeat(400));
    expect(record.truncated).toBeUndefined();
    expect(Buffer.byteLength(JSON.stringify(record))).toBeLessThanOrEqual(4 * 1024);
  });

  test('an event that cannot fit even with short text becomes a marked minimal record instead of throwing', () => {
    const long = (prefix: string) => `${prefix}-`.padEnd(1_000, 'x');
    const event = makeEvent({
      kind: 'test-result',
      payload: {
        testId: long('test'),
        title: 'title',
        attempt: 2,
        status: 'failed',
        durationMs: 1,
        failure: { failureId: long('failure'), kind: 'test', error: { name: 'Error', message: 'message' } },
      },
    });
    const record = { ...event, runId: long('run'), eventId: long('event'), sourceId: long('source'), scopeId: long('scope') };

    const projected = projectDesktopEvent(record as CollectedDesktopEvent);

    expect(projected.truncated).toBe(true);
    expect(projected).toMatchObject({ kind: 'test-result', payload: { attempt: 2, status: 'failed' } });
    expect(Buffer.byteLength(JSON.stringify(projected))).toBeLessThanOrEqual(4 * 1024);
  });
});

function makeEvent(data: Pick<CollectedDesktopEvent, 'kind' | 'payload'>): CollectedDesktopEvent {
  return {
    schemaVersion: 1,
    runId: 'run-id',
    eventId: 'event-id',
    sourceId: 'worker',
    sourceSequence: 1,
    scopeId: 'scope-id',
    timestamp: new Date(0).toISOString(),
    arrivalSequence: 1,
    ...data,
  } as CollectedDesktopEvent;
}

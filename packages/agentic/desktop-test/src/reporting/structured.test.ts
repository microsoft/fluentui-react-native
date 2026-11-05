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

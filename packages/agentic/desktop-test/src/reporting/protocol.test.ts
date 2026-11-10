import {
  DesktopIncompleteError,
  DesktopReportedError,
  isDesktopIncompleteError,
  redactDesktopSecrets,
  validateDesktopEvent,
} from './protocol';

describe('declared gaps and selection events', () => {
  function event(kind: string, payload: Record<string, unknown>): unknown {
    return {
      schemaVersion: 1,
      runId: 'run-id',
      eventId: 'event-id',
      sourceId: 'worker',
      sourceSequence: 1,
      scopeId: 'scope-id',
      timestamp: new Date(0).toISOString(),
      kind,
      payload,
    };
  }
  const result = { testId: 'test', title: 'test', attempt: 0, durationMs: 0, reason: 'Declared in the story.' };

  test.each(['unsupported', 'quarantine'])('accepts a %s gap on an unsupported result', (gap) => {
    expect(() => validateDesktopEvent(event('test-result', { ...result, status: 'unsupported', gap }))).not.toThrow();
  });

  test.each(['skipped', 'failed', 'passed'])('rejects a declared gap on a %s result', (status) => {
    expect(() => validateDesktopEvent(event('test-result', { ...result, status, gap: 'unsupported' }))).toThrow();
  });

  test('rejects an unknown gap kind', () => {
    expect(() => validateDesktopEvent(event('test-result', { ...result, status: 'unsupported', gap: 'flaky' }))).toThrow();
  });

  test('accepts delivered input, and undeclared input only on a failed result', () => {
    const receipts = { 'accessibility-click': 1, keyboard: 2 };
    const failed = {
      ...result,
      status: 'failed',
      failure: { failureId: 'failure', kind: 'test', error: { name: 'Error', message: 'Undeclared input.' } },
    };
    expect(() => validateDesktopEvent(event('test-result', { ...result, status: 'passed', input: { receipts } }))).not.toThrow();
    expect(() =>
      validateDesktopEvent(event('test-result', { ...result, status: 'passed', input: { receipts, unused: ['wheel'] } })),
    ).not.toThrow();
    expect(() => validateDesktopEvent(event('test-result', { ...failed, input: { receipts, undeclared: ['keyboard'] } }))).not.toThrow();
    expect(() =>
      validateDesktopEvent(event('test-result', { ...result, status: 'passed', input: { receipts, undeclared: ['keyboard'] } })),
    ).toThrow('must fail');
  });

  test.each([
    ['an unknown mechanism', { receipts: { typing: 1 } }],
    ['a negative count', { receipts: { keyboard: -1 } }],
    ['an empty undeclared list', { receipts: {}, undeclared: [] }],
    ['an unknown requirement', { receipts: {}, unused: ['typing'] }],
    ['an unknown field', { receipts: {}, typed: 'secret' }],
  ])('rejects input with %s', (_name, input) => {
    // A passed result needs nothing else, so the input is what fails it.
    expect(() => validateDesktopEvent(event('test-result', { ...result, status: 'passed', input }))).toThrow();
  });

  test('accepts exactly the three non-negative integer exclusion counts', () => {
    expect(() => validateDesktopEvent(event('selection', { excluded: { platform: 1, scope: 0, input: 12 } }))).not.toThrow();
  });

  test('accepts a scope end summary, even an empty one, and rejects one that is not text', () => {
    expect(() => validateDesktopEvent(event('scope-end', { status: 'passed', summary: '30 of 101 story tests executed' }))).not.toThrow();
    expect(() => validateDesktopEvent(event('scope-end', { status: 'passed', summary: '' }))).not.toThrow();
    expect(() => validateDesktopEvent(event('scope-end', { status: 'passed', summary: 3 }))).toThrow('summary must be text');
  });

  test('accepts an optional idempotency key and rejects an empty one', () => {
    const excluded = { platform: 1, scope: 0, input: 0 };
    expect(() => validateDesktopEvent(event('selection', { excluded, key: 'wdio-group' }))).not.toThrow();
    expect(() => validateDesktopEvent(event('selection', { excluded, key: '' }))).toThrow();
  });

  test.each([
    ['a missing reason', { platform: 1, scope: 0 }],
    ['an unknown reason', { platform: 1, scope: 0, input: 0, flaky: 1 }],
    ['a negative count', { platform: -1, scope: 0, input: 0 }],
    ['a fractional count', { platform: 0.5, scope: 0, input: 0 }],
  ])('rejects a selection with %s', (_name, excluded) => {
    expect(() => validateDesktopEvent(event('selection', { excluded }))).toThrow();
  });

  test('a producer cannot report the collector-only run-finished event', () => {
    const finished = event('run-finished', { status: 'passed', resultPath: 'run.json' });
    expect(() => validateDesktopEvent(finished)).toThrow('A producer cannot report "run-finished".');
    expect(() => validateDesktopEvent(finished, 'collector')).not.toThrow();
  });
});

describe('incomplete verdict errors', () => {
  const relayed = (name: string) =>
    new DesktopReportedError({ failureId: 'failure', kind: 'infrastructure', error: { name, message: 'relayed' } });

  test('recognizes the typed error, its relayed form, and an aggregate of only such errors', () => {
    expect(isDesktopIncompleteError(new DesktopIncompleteError('nothing executed'))).toBe(true);
    expect(isDesktopIncompleteError(relayed('DesktopIncompleteError'))).toBe(true);
    expect(isDesktopIncompleteError(new AggregateError([new DesktopIncompleteError('a'), relayed('DesktopIncompleteError')]))).toBe(true);
  });

  test('never recognizes a fault, an aggregate that contains one, or an error that merely wraps the verdict', () => {
    expect(isDesktopIncompleteError(new Error('boom'))).toBe(false);
    expect(isDesktopIncompleteError(relayed('Error'))).toBe(false);
    expect(isDesktopIncompleteError(new AggregateError([new DesktopIncompleteError('a'), new Error('b')]))).toBe(false);
    expect(isDesktopIncompleteError(new Error('wrapped', { cause: new DesktopIncompleteError('a') }))).toBe(false);
    expect(isDesktopIncompleteError(new AggregateError([]))).toBe(false);
    expect(isDesktopIncompleteError('DesktopIncompleteError')).toBe(false);
  });
});

describe('redactDesktopSecrets', () => {
  test('redacts known secrets, longest first', () => {
    expect(redactDesktopSecrets('token abc and abcdef', ['abc', 'abcdef'])).toBe('token [REDACTED] and [REDACTED]');
  });

  test.each([
    ['password=hunter2', 'password=[REDACTED]'],
    ['leaseNonce: n-1', 'leaseNonce: [REDACTED]'],
    ['{"bridgeNonce":"n-2"}', '{"bridgeNonce":"[REDACTED]"}'],
    ['"authorization" : "Bearer"', '"authorization" : "[REDACTED]"'],
    ['access-token = t; next', 'access-token = [REDACTED]; next'],
    ['ACCESS_TOKEN:t', 'ACCESS_TOKEN:[REDACTED]'],
  ])('redacts the value assigned in %s', (input, expected) => {
    expect(redactDesktopSecrets(input, [])).toBe(expected);
  });

  test('leaves unassigned keywords alone', () => {
    expect(redactDesktopSecrets('password reset requested', [])).toBe('password reset requested');
  });

  test('stays linear on keywords followed by long whitespace without an assignment', () => {
    const input = `${'password'}${' '.repeat(50_000)}x`.repeat(4);
    const started = performance.now();
    expect(redactDesktopSecrets(input, [])).toBe(input);
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});

import { redactDesktopSecrets, validateDesktopEvent } from './protocol';

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

import { randomUUID } from 'node:crypto';

import { DesktopFailureRegistry } from './failures.js';
import { DesktopIncompleteError, DesktopReportedError, redactDesktopSecrets, sanitizeDesktopReport } from './protocol.js';
import type { ReportFailure } from './protocol.js';

describe('desktop failure registry', () => {
  const secrets = new Set<string>();
  const registry = () => new DesktopFailureRegistry((value) => sanitizeDesktopReport(value, (text) => redactDesktopSecrets(text, secrets)));

  afterEach(() => secrets.clear());

  test('redacts a secret whose JSON encoding differs from its text', () => {
    const secret = 'C:\\keys\\pa"ss';
    secrets.add(secret);
    const failure = registry().failure(new Error(`cannot read ${secret}`), 'test');

    expect(failure.error.message).toBe('cannot read [REDACTED]');
    expect(JSON.stringify(failure)).not.toContain('keys');
    expect(JSON.stringify(failure)).not.toContain('pa\\"ss');
  });

  test('redacts a failure relayed from another process, and one registered after it was created', () => {
    const relayed = new DesktopReportedError({
      failureId: randomUUID(),
      kind: 'test',
      error: { name: 'Error', message: 'late "quoted" secret', stack: 'Error: late "quoted" secret\n    at here' },
    });
    secrets.add('late "quoted" secret');

    expect(registry().failure(relayed)).toMatchObject({ error: { message: '[REDACTED]', stack: expect.not.stringContaining('quoted') } });
  });

  test('records each error once, however many times or in what shape it is reported', () => {
    const failures = registry();
    const recorded: ReportFailure[] = [];
    const error = new Error('boom');
    const first = failures.fail(
      error,
      'test',
      (failure) => recorded.push(failure),
      () => false,
    );
    failures.fail(
      error,
      'test',
      (failure) => recorded.push(failure),
      () => false,
    );
    failures.fail(
      new Error('wrapped', { cause: error }),
      'test',
      (failure) => recorded.push(failure),
      () => false,
    );
    failures.fail(
      new AggregateError([error], 'group'),
      'test',
      (failure) => recorded.push(failure),
      () => false,
    );

    expect(recorded).toEqual([first]);
    expect([...failures.recorded.keys()]).toEqual([first.failureId]);
  });

  test('offers an incomplete verdict once and records it as a failure only when the run does not carry it', () => {
    const failures = registry();
    const recorded: ReportFailure[] = [];
    const offered: ReportFailure[] = [];
    const carried = new DesktopIncompleteError('no coverage');
    failures.fail(
      carried,
      'infrastructure',
      (failure) => recorded.push(failure),
      (failure) => (offered.push(failure), true),
    );
    failures.fail(
      carried,
      'infrastructure',
      (failure) => recorded.push(failure),
      (failure) => (offered.push(failure), true),
    );

    expect(offered).toHaveLength(1);
    expect(recorded).toEqual([]);
    expect(failures.recorded.size).toBe(0);

    const uncarried = new DesktopIncompleteError('nothing else says so');
    failures.fail(
      uncarried,
      'infrastructure',
      (failure) => recorded.push(failure),
      () => false,
    );
    expect(recorded).toHaveLength(1);
    expect(recorded[0].error.name).toBe('DesktopIncompleteError');
  });

  test('an error that only wraps an incomplete verdict is still a failure', () => {
    const failures = registry();
    const recorded: ReportFailure[] = [];
    failures.fail(
      new Error('crash', { cause: new DesktopIncompleteError('inner') }),
      'infrastructure',
      (failure) => recorded.push(failure),
      () => true,
    );

    expect(recorded).toHaveLength(1);
  });
});

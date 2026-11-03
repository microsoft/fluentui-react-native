import {
  attachFailureEffect,
  attachMutationReport,
  createMutationReport,
  dispositionOfFailure,
  parseMutationEffect,
  readFailureEffect,
  readMutationReport,
} from './settlement';

describe('mutation settlement', () => {
  test.each(['applied', 'none', 'partial', 'unknown'])('accepts the provider effect %p', (effect) => {
    expect(parseMutationEffect(effect)).toBe(effect);
  });

  test.each([undefined, null, 1, '', 'APPLIED', 'maybe', {}])('rejects the unrecognized effect %p', (value) => {
    expect(parseMutationEffect(value)).toBeUndefined();
  });

  test('records an effect on a failure and reads it back', () => {
    const failure = attachFailureEffect(new Error('boom'), 'partial');

    expect(failure.message).toBe('boom');
    expect(readFailureEffect(failure)).toBe('partial');
  });

  test('leaves a failure unannotated when no effect is supplied, ignoring non-errors and forged values', () => {
    const forged = Object.assign(new Error('forged'), { effect: 'definitely-applied' });

    expect(readFailureEffect(attachFailureEffect(new Error('plain'), undefined))).toBeUndefined();
    expect(readFailureEffect({ effect: 'none' })).toBeUndefined();
    expect(readFailureEffect(forged)).toBeUndefined();
  });

  test.each([
    ['none', 'rejected'],
    ['applied', 'applied'],
    ['partial', 'indeterminate'],
    ['unknown', 'indeterminate'],
  ] as const)('classifies a failure with effect %p as %p', (effect, disposition) => {
    expect(dispositionOfFailure(attachFailureEffect(new Error('x'), effect))).toBe(disposition);
  });

  test('fails closed for failures that report nothing', () => {
    expect(dispositionOfFailure(new Error('unannotated'))).toBe('indeterminate');
    expect(dispositionOfFailure('not an error')).toBe('indeterminate');
    expect(createMutationReport(new Error('unannotated'), true)).toEqual({
      disposition: 'indeterminate',
      effect: 'unknown',
      quarantined: true,
    });
  });

  test('builds a report from a reported effect and carries it on the failure', () => {
    const failure = attachFailureEffect(new Error('x'), 'none');
    const report = createMutationReport(failure, false);

    expect(report).toEqual({ disposition: 'rejected', effect: 'none', quarantined: false });
    expect(readMutationReport(attachMutationReport(failure, report))).toBe(report);
    expect(readMutationReport(new Error('no report'))).toBeUndefined();
    expect(readMutationReport({ mutation: report })).toBeUndefined();
  });
});

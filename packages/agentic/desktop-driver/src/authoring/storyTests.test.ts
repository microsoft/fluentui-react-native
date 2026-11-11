import { validateDesktopExpectation, validateDesktopStoryTests } from './storyTests.js';

describe('validateDesktopStoryTests', () => {
  test('requires boolean values for required-form assertions', () => {
    for (const value of [true, false]) {
      const plan = {
        version: 1,
        tests: [{ id: 'required', steps: [{ expect: { state: 'required', target: { testId: 'field' }, value } }] }],
      };
      expect(validateDesktopStoryTests(plan)).toBe(plan);
    }
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [{ id: 'required', steps: [{ expect: { state: 'required', target: { testId: 'field' }, value: 'false' } }] }],
      }),
    ).toThrow('must be a boolean');
  });

  test('accepts a serializable versioned plan', () => {
    const plan = {
      version: 1,
      tests: [{ id: 'click', steps: [{ action: 'click', target: { testId: 'button' } }] }],
    } as const;

    expect(validateDesktopStoryTests(plan)).toBe(plan);
  });

  test('rejects duplicate ids and executable values', () => {
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          { id: 'duplicate', steps: [{ action: 'note', message: 'first' }] },
          { id: 'duplicate', steps: [{ action: 'note', message: 'second' }] },
        ],
      }),
    ).toThrow('duplicate test id');
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [{ id: 'function', steps: [{ action: 'setArgs', args: { run: () => undefined } }] }],
      }),
    ).toThrow('JSON-serializable');
  });

  test('rejects non-finite numbers before digest serialization', () => {
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          {
            id: 'non-finite',
            steps: [{ action: 'setArgs', args: { invalid: Number.POSITIVE_INFINITY } }],
          },
        ],
      }),
    ).toThrow('finite numbers');
  });

  test('rejects malformed authored W3C action sequences', () => {
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          {
            id: 'invalid-actions',
            steps: [{ action: 'actions', sequences: [{ id: 'bad', type: 'key', actions: [{ type: 'pointerDown' }] }] }],
          },
        ],
      }),
    ).toThrow('sequences are invalid');
  });

  const planOf = (...steps: object[]) => ({ version: 1, tests: [{ id: 'case', steps }] });
  const noteStep = { action: 'note', message: 'x' };

  test('rejects empty and duplicated key lists, platform filters and requirement lists', () => {
    expect(() => validateDesktopStoryTests(planOf({ action: 'keys', value: [] }))).toThrow('non-empty string array');
    expect(() => validateDesktopStoryTests({ version: 1, tests: [{ id: 'a', platforms: [], steps: [noteStep] }] })).toThrow(
      'platforms must not be empty',
    );
    expect(() => validateDesktopStoryTests({ version: 1, tests: [{ id: 'a', requires: [], steps: [noteStep] }] })).toThrow(
      'requires must not be empty',
    );
    expect(() => validateDesktopStoryTests({ version: 1, tests: [{ id: 'a', platforms: ['macos', 'macos'], steps: [noteStep] }] })).toThrow(
      'duplicate "macos"',
    );
    expect(() => validateDesktopStoryTests({ version: 1, tests: [{ id: 'a', requires: ['focus', 'focus'], steps: [noteStep] }] })).toThrow(
      'duplicate "focus"',
    );
  });

  test.each([-1, 1.5, 120_001, Number.POSITIVE_INFINITY, '5000'])('rejects the wait timeout %p instead of clamping it', (timeoutMs) => {
    expect(() => validateDesktopStoryTests(planOf({ action: 'wait', target: { testId: 'x' }, timeoutMs }))).toThrow(
      'integer from 0 to 120000',
    );
  });

  test('accepts the largest wait timeout and a zero one', () => {
    for (const timeoutMs of [0, 120_000]) {
      expect(() => validateDesktopStoryTests(planOf({ action: 'wait', target: { testId: 'x' }, timeoutMs }))).not.toThrow();
    }
  });

  test('rejects an artifact name another step in the test already writes, ignoring case and sanitized characters', () => {
    expect(() =>
      validateDesktopStoryTests(planOf({ action: 'screenshot', name: 'Shot 1' }, { action: 'screenshot', name: 'shot-1' })),
    ).toThrow('repeats the screenshot name "shot-1"');
    expect(() => validateDesktopStoryTests(planOf({ action: 'source', name: 'a/b' }, { action: 'source', name: 'a:b' }))).toThrow(
      'repeats the source name',
    );
    expect(() =>
      validateDesktopStoryTests(planOf({ action: 'screenshot', name: 'same' }, { action: 'source', name: 'same' })),
    ).not.toThrow();
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          { id: 'one', steps: [{ action: 'screenshot', name: 'same' }] },
          { id: 'two', steps: [{ action: 'screenshot', name: 'same' }] },
        ],
      }),
    ).not.toThrow();
  });

  test('keeps the failure namespace for evidence and rejects names with nothing to name a file', () => {
    for (const name of ['failure', 'Failure-source', 'failure window']) {
      expect(() => validateDesktopStoryTests(planOf({ action: 'screenshot', name }))).toThrow('belong to failure evidence');
    }
    expect(() => validateDesktopStoryTests(planOf({ action: 'screenshot', name: 'failures' }))).not.toThrow();
    expect(() => validateDesktopStoryTests(planOf({ action: 'source', name: '..' }))).toThrow('at least one letter or digit');
  });

  test('checks a run-time expectation with the same rules as a planned one', () => {
    expect(validateDesktopExpectation({ state: 'text', target: { testId: 'x' }, value: 'ok' })).toEqual({
      state: 'text',
      target: { testId: 'x' },
      value: 'ok',
    });
    expect(() => validateDesktopExpectation({ state: 'text', target: { testId: 'x' }, value: 3 })).toThrow('must be a string');
    expect(() => validateDesktopExpectation({ state: 'count', target: { role: 'button' } })).toThrow('must be a number');
    expect(() => validateDesktopExpectation({ state: 'enabled', target: { testId: 'x' }, extra: 1 })).toThrow('unknown field');
  });
});

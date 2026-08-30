import { validateDesktopStoryTests } from './storyTests.js';

describe('validateDesktopStoryTests', () => {
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
});

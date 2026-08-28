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
          { id: 'duplicate', steps: [] },
          { id: 'duplicate', steps: [] },
        ],
      }),
    ).toThrow('duplicate test id');
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [{ id: 'function', steps: [], run: () => undefined }],
      }),
    ).toThrow('JSON-serializable');
  });
});

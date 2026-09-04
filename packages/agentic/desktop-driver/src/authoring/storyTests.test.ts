import { resolveDesktopStoryTests, validateDesktopStoryTests } from './storyTests.js';

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

  test('resolves story support and complete platform variants', () => {
    const plan = validateDesktopStoryTests({
      supportedPlatforms: ['macos', 'windows'],
      version: 1,
      tests: [
        {
          id: 'activate',
          requires: ['focus', 'physical-click'],
          steps: [
            { action: 'click', target: { testId: 'button' } },
            { expect: { state: 'focused', target: { testId: 'button' }, value: true } },
          ],
          platformVariants: {
            macos: {
              requires: ['physical-click'],
              steps: [
                { action: 'click', target: { testId: 'button' } },
                { action: 'pause', durationMs: 10 },
                { expect: { state: 'exists', target: { testId: 'button' }, value: true } },
              ],
            },
          },
        },
      ],
    });

    expect(resolveDesktopStoryTests(plan, 'macos')).toMatchObject({
      supportedPlatforms: ['macos', 'windows'],
      tests: [
        {
          id: 'activate',
          requires: ['physical-click'],
          steps: [{ action: 'click' }, { action: 'pause', durationMs: 10 }, { expect: { state: 'exists' } }],
        },
      ],
    });
    expect(resolveDesktopStoryTests(plan, 'windows')?.tests[0]).toMatchObject({
      requires: ['focus', 'physical-click'],
      steps: [{ action: 'click' }, { expect: { state: 'focused' } }],
    });
    expect(resolveDesktopStoryTests(plan, 'win32')).toBeUndefined();
  });

  test('validates traversal platforms as a subset of story support', () => {
    expect(
      validateDesktopStoryTests({
        supportedPlatforms: ['macos', 'windows'],
        tests: [],
        traversePlatforms: [],
        version: 1,
      }),
    ).toMatchObject({ traversePlatforms: [] });
    expect(() =>
      validateDesktopStoryTests({
        supportedPlatforms: ['windows'],
        tests: [],
        traversePlatforms: ['macos'],
        version: 1,
      }),
    ).toThrow('not included by');
  });

  test('rejects platform filters and variants outside story support', () => {
    expect(() =>
      validateDesktopStoryTests({
        supportedPlatforms: ['windows'],
        version: 1,
        tests: [
          {
            id: 'invalid-platform',
            platforms: ['macos'],
            steps: [{ action: 'note', message: 'invalid' }],
          },
        ],
      }),
    ).toThrow('not included by');
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          {
            id: 'invalid-variant',
            platforms: ['windows'],
            platformVariants: {
              macos: {
                steps: [{ action: 'note', message: 'invalid' }],
              },
            },
            steps: [{ action: 'note', message: 'base' }],
          },
        ],
      }),
    ).toThrow('not included by');
  });

  test('validates quarantine metadata', () => {
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          {
            id: 'quarantined',
            quarantine: { expires: 'not-a-date', issue: '#1', owner: '@owner' },
            steps: [{ action: 'note', message: 'quarantined' }],
          },
        ],
      }),
    ).toThrow('valid YYYY-MM-DD date');
    expect(() =>
      validateDesktopStoryTests({
        version: 1,
        tests: [
          {
            id: 'quarantined',
            quarantine: { expires: '2026-02-30', issue: '#1', owner: '@owner' },
            steps: [{ action: 'note', message: 'quarantined' }],
          },
        ],
      }),
    ).toThrow('valid YYYY-MM-DD date');
  });
});

import { assertPortableTestId, byTestId, isPortableTestId } from './selectors.ts';
import { planTestIds, validateStoryPlan } from './story-plan.ts';
import { sanitizeStoryPart, storyGrep, storyNameFromExport, storyTag, toStoryId } from './storybook/story-id.ts';
import { runInlineStoryPlan } from './wdio/story-plan-runner.ts';
import type { DesktopBrowserLike } from './core/session.ts';
import type { InlineStoryPlan } from './types.ts';

describe('portable selectors', () => {
  it('produces an accessibility-id selector', () => {
    expect(byTestId('agentic-storybook-button')).toBe('~agentic-storybook-button');
  });

  it.each([['~already-prefixed'], ['=text selector'], ['//xpath'], ['#css'], ['has space'], [' leading'], [''], ['id=thing']])(
    'rejects the ambiguous testID %p',
    (testId) => {
      expect(isPortableTestId(testId)).toBe(false);
      expect(() => assertPortableTestId(testId)).toThrow();
    },
  );

  it.each([['button'], ['agentic.storybook:button-1'], ['A1']])('accepts the portable testID %p', (testId) => {
    expect(isPortableTestId(testId)).toBe(true);
  });
});

describe('story identifiers', () => {
  it('matches Storybook sanitization', () => {
    expect(sanitizeStoryPart('Components/Button')).toBe('components-button');
    expect(sanitizeStoryPart('Primitives/Icon')).toBe('primitives-icon');
  });

  /**
   * Reference outputs captured from the installed Storybook's own `storyNameFromExport` and
   * `toId`. The generated manifest must agree with the identifiers the running application uses,
   * so any divergence here is a real defect, not a formatting preference.
   */
  it.each([
    ['Default', 'Default', 'components-button--default'],
    ['WithLongText', 'With Long Text', 'components-button--with-long-text'],
    ['Overview', 'Overview', 'components-button--overview'],
    ['Interaction', 'Interaction', 'components-button--interaction'],
    ['Size24', 'Size 24', 'components-button--size-24'],
    ['Level1', 'Level 1', 'components-button--level-1'],
    ['A11yLabel', 'A 11 Y Label', 'components-button--a-11-y-label'],
    ['With_Snake', 'With Snake', 'components-button--with-snake'],
    ['with-dash', 'With Dash', 'components-button--with-dash'],
    ['HTMLButton', 'HTML Button', 'components-button--html-button'],
  ])('derives the same name and id Storybook does for %p', (exportName, expectedName, expectedId) => {
    expect(storyNameFromExport(exportName)).toBe(expectedName);
    expect(toStoryId('Components/Button', storyNameFromExport(exportName))).toBe(expectedId);
  });

  it('produces a greppable tag', () => {
    expect(storyTag('components-button--default')).toBe('[story:components-button--default]');
    expect(storyGrep('components-button--default')).toBe('\\[story:components-button--default\\]');
    expect(new RegExp(storyGrep('components-button--default')).test('[story:components-button--default] Button')).toBe(true);
  });
});

describe('story plan validation', () => {
  const inline: InlineStoryPlan = {
    kind: 'inline',
    id: 'button-default',
    steps: [
      { action: 'expectVisible', target: { testId: 'button' } },
      { action: 'press', target: { testId: 'button' } },
      { action: 'expect', target: { testId: 'status' }, property: 'text', equals: 'Pressed' },
    ],
  };

  it('accepts a well-formed inline plan', () => {
    expect(validateStoryPlan(inline)).toBe(inline);
    expect(planTestIds(inline)).toEqual(['button', 'status']);
  });

  describe('story plan execution prerequisites', () => {
    it('fails clearly when the desktop command augmentation is missing', async () => {
      const browser = {
        sessionId: 'session',
        $: jest.fn(),
        execute: jest.fn(),
        getPageSource: jest.fn(),
        takeScreenshot: jest.fn(),
        addCommand: jest.fn(),
      } as unknown as DesktopBrowserLike;

      await expect(runInlineStoryPlan({ kind: 'inline', id: 'missing-augmentation', steps: [] }, { browser })).rejects.toMatchObject({
        kind: 'capability',
        message: expect.stringContaining('command augmentation'),
      });
    });
  });

  it('accepts a linked spec plan', () => {
    expect(validateStoryPlan({ kind: 'spec', id: 'button-rich', spec: './button.desktop.spec.ts' })).toMatchObject({ kind: 'spec' });
  });

  it('rejects a non-relative spec path', () => {
    expect(() => validateStoryPlan({ kind: 'spec', id: 'x', spec: '/etc/passwd' })).toThrow(/relative path/);
  });

  it('rejects a target that is not a bare testId', () => {
    expect(() => validateStoryPlan({ kind: 'inline', id: 'x', steps: [{ action: 'press', target: { xpath: '//button' } }] })).toThrow(
      /exactly one property, "testId"/,
    );
  });

  it('rejects an unknown action', () => {
    expect(() => validateStoryPlan({ kind: 'inline', id: 'x', steps: [{ action: 'evaluate' }] })).toThrow(/must be one of/);
  });

  it('rejects an expectation whose value type does not match the property', () => {
    expect(() =>
      validateStoryPlan({
        kind: 'inline',
        id: 'x',
        steps: [{ action: 'expect', target: { testId: 'a' }, property: 'enabled', equals: 'true' }],
      }),
    ).toThrow(/must be a boolean/);
  });

  it('rejects a plan id that is not kebab-case', () => {
    expect(() => validateStoryPlan({ ...inline, id: 'Button Default' })).toThrow(/kebab-case/);
  });

  it('rejects a non-serializable plan', () => {
    const cyclic: Record<string, unknown> = { kind: 'inline', id: 'x', steps: [] };
    cyclic.self = cyclic;
    expect(() => validateStoryPlan(cyclic)).toThrow(/JSON-serializable/);
  });

  it('accepts repeated references that are not cyclic', () => {
    const target = { testId: 'shared-target' };
    expect(() =>
      validateStoryPlan({
        kind: 'inline',
        id: 'shared',
        steps: [
          { action: 'expectVisible', target },
          { action: 'press', target },
        ],
      }),
    ).not.toThrow();
  });

  it('rejects an unsupported schema version', () => {
    expect(() => validateStoryPlan({ ...inline, version: 99 })).toThrow(/version/);
  });
});

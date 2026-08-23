import { sanitizeStoryPart, storyGrep, storyNameFromExport, storyTag, toStoryId } from './story-id.ts';

describe('story identifiers', () => {
  it('matches Storybook sanitization', () => {
    expect(sanitizeStoryPart('Components/Button')).toBe('components-button');
    expect(sanitizeStoryPart('Primitives/Icon')).toBe('primitives-icon');
  });

  /**
   * Reference outputs captured from the installed Storybook's own `storyNameFromExport` and
   * `toId`. The generated manifest must agree with identifiers the running application uses.
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

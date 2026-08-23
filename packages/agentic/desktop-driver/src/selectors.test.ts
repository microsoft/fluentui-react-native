import { assertPortableTestId, byTestId, isPortableTestId } from './selectors.ts';

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

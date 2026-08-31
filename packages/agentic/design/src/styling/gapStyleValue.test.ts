import { getGapStyleValue } from './gapStyleValue';

describe('getGapStyleValue', () => {
  it('accepts valid gap token values', () => {
    expect(getGapStyleValue(8)).toBe(8);
    expect(getGapStyleValue('8')).toBe('8');
  });

  it('rejects invalid gap token values', () => {
    expect(() => getGapStyleValue('8px')).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getGapStyleValue(undefined)).toThrow('Style values must be finite numbers or numeric strings.');
  });
});

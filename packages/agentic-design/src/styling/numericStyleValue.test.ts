import { getNumericStyleValue } from './numericStyleValue';

describe('getNumericStyleValue', () => {
  it('accepts finite numbers and numeric strings', () => {
    expect(getNumericStyleValue(12)).toBe(12);
    expect(getNumericStyleValue(12.5)).toBe(12.5);
    expect(getNumericStyleValue('12')).toBe('12');
    expect(getNumericStyleValue(' 12.5 ')).toBe('12.5');
    expect(getNumericStyleValue('12.')).toBe('12.');
    expect(getNumericStyleValue('.5')).toBe('.5');
    expect(getNumericStyleValue('-1e3')).toBe('-1e3');
    expect(getNumericStyleValue('+1.5E10')).toBe('+1.5E10');
  });

  it('rejects invalid numeric values', () => {
    expect(() => getNumericStyleValue(Number.NaN)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValue(Number.POSITIVE_INFINITY)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValue('12px')).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValue(`${'9'.repeat(100_000)}!`)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValue('')).toThrow('Style values must be finite numbers or numeric strings.');
  });
});

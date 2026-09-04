import { getNumericStyleValueAsNumber } from './numericStyleValueAsNumber';

describe('getNumericStyleValueAsNumber', () => {
  it('returns finite numbers unchanged', () => {
    expect(getNumericStyleValueAsNumber(12)).toBe(12);
    expect(getNumericStyleValueAsNumber(12.5)).toBe(12.5);
    expect(getNumericStyleValueAsNumber(0)).toBe(0);
    expect(getNumericStyleValueAsNumber(-1)).toBe(-1);
  });

  it('coerces numeric strings, including exponent and whitespace, to numbers', () => {
    expect(getNumericStyleValueAsNumber('12')).toBe(12);
    expect(getNumericStyleValueAsNumber(' 12.5 ')).toBe(12.5);
    expect(getNumericStyleValueAsNumber('12.')).toBe(12);
    expect(getNumericStyleValueAsNumber('.5')).toBe(0.5);
    expect(getNumericStyleValueAsNumber('-1e3')).toBe(-1000);
    expect(getNumericStyleValueAsNumber('+1.5E10')).toBe(1.5e10);
  });

  it('rejects invalid numeric values', () => {
    expect(() => getNumericStyleValueAsNumber(Number.NaN)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValueAsNumber(Number.POSITIVE_INFINITY)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValueAsNumber('12px')).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValueAsNumber('')).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValueAsNumber(null)).toThrow('Style values must be finite numbers or numeric strings.');
    expect(() => getNumericStyleValueAsNumber(undefined)).toThrow('Style values must be finite numbers or numeric strings.');
  });
});

import { borderStyleToken, fontWeightToken, textDecorationStyleToken } from './styleEnumTokens';
import { enumToken } from './tokenFields';

it('distinguishes style fields with overlapping enums', () => {
  expect(textDecorationStyleToken('double')).toBe('double');
  expect(() => borderStyleToken('double')).toThrow(TypeError);
});

it('preserves numeric and string enum members without coercion', () => {
  expect(fontWeightToken(400)).toBe(400);
  expect(fontWeightToken('400')).toBe('400');
  expect(() => fontWeightToken(450)).toThrow(TypeError);
});

it('supports reusable validators for application-specific fields', () => {
  const emphasisToken = enumToken(['quiet', 'loud']);
  expect(emphasisToken('quiet')).toBe('quiet');
  expect(() => emphasisToken('normal')).toThrow(TypeError);
});

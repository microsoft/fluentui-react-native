import { IFontFamilies, IFontSizes, IFontWeights, ITypography } from './Typography.types';
import { resolveFontFamily, resolveFontSize, resolveFontWeight } from './Typography';

const families = {
  primary: 'Verdana',
  monospace: 'Courier New'
} as IFontFamilies;

const sizes = {
  xSmall: 8,
  xLarge: 16
} as IFontSizes;

const weights = {
  medium: '500',
  semiBold: '700'
} as IFontWeights;

const typography: ITypography = {
  families,
  sizes,
  weights
};

describe('Typography tests', () => {
  test('resolveFontFamily "monospace" returns "Courier New"', () => {
    expect(resolveFontFamily(typography, 'monospace')).toBe('Courier New');
  });

  test('resolveFontFamily "Arial" returns "Arial"', () => {
    expect(resolveFontFamily(typography, 'Arial')).toBe('Arial');
  });

  test('resolveFontSize "xSmall" returns 8', () => {
    expect(resolveFontSize(typography, 'xSmall')).toBe(8);
  });

  test('resolveFontSize 15 returns 15', () => {
    expect(resolveFontSize(typography, 15)).toBe(15);
  });

  test('resolveFontSize "semiBold" returns 700', () => {
    expect(resolveFontWeight(typography, 'semiBold')).toBe('700');
  });

  test('resolveFontSize 200 returns 200', () => {
    expect(resolveFontWeight(typography, '200')).toBe('200');
  });
});

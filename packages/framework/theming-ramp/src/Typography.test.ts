import { IFontFamilies, IFontSizes, IFontWeights, IFontVariants, ITypography } from './Typography.types';
import { resolveFontFamily, resolveFontSize, resolveFontWeight } from './Typography';

const families = {
  primary: 'Verdana',
  monospace: 'Courier New'
} as IFontFamilies;

const sizes = {
  small: 8,
  extraLarge: 16
} as IFontSizes;

const weights = {
  regular: '400',
  semiBold: '700'
} as IFontWeights;

const variants = {
  mediumStandard: {
    face: 'Verdana',
    size: 12,
    weight: '400'
  }
} as IFontVariants;

const typography: ITypography = {
  families,
  sizes,
  weights,
  variants
};

describe('Typography tests', () => {
  test('resolveFontFamily "monospace" returns "Courier New"', () => {
    expect(resolveFontFamily(typography, 'monospace')).toBe('Courier New');
  });

  test('resolveFontFamily "Arial" returns "Arial"', () => {
    expect(resolveFontFamily(typography, 'Arial')).toBe('Arial');
  });

  test('resolveFontSize "small" returns 8', () => {
    expect(resolveFontSize(typography, 'small')).toBe(8);
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

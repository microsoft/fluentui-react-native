import { IFontFamilies, IFontSizes, IFontWeights, ITypography, IPartialTypography } from './Typography.types';
import { resolveFontFamily, resolveFontSize, resolveFontWeight, resolvePartialTypography } from './Typography';

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

const partialTypography: IPartialTypography = {
  sizes: {
    xSmall: 5
  },
  weights: {
    light: '200'
  }
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

  test('resolvePartialTypography returns the typography object when no partial typography is given', () => {
    const resolved = resolvePartialTypography(typography);
    expect(resolved).toBe(typography);
  });

  test('resolvePartialTypography returns a copy of the typography when the partial typography is empty', () => {
    const resolved = resolvePartialTypography(typography, {});
    expect(resolved).toEqual(typography);
    expect(resolved).not.toBe(typography);
  });

  test("resolvePartialTypography reuses the typography's families object when the partial typography is empty", () => {
    const resolved = resolvePartialTypography(typography, {});
    expect(resolved.families).toBe(typography.families);
  });

  test("resolvePartialTypography reuses the typography's sizes object when the partial typography is empty", () => {
    const resolved = resolvePartialTypography(typography, {});
    expect(resolved.sizes).toBe(typography.sizes);
  });

  test("resolvePartialTypography reuses the typography's weights object when the partial typography is empty", () => {
    const resolved = resolvePartialTypography(typography, {});
    expect(resolved.weights).toBe(typography.weights);
  });

  test('resolvePartialTypography copies typography.families when the partial typography has an empty families property', () => {
    const resolved = resolvePartialTypography(typography, {
      families: {}
    });
    expect(resolved.families).toEqual(typography.families);
    expect(resolved.families).not.toBe(typography.families);
  });

  test('resolvePartialTypography copies typography.weights when the partial typography has an empty weights property', () => {
    const resolved = resolvePartialTypography(typography, {
      weights: {}
    });
    expect(resolved.weights).toEqual(typography.weights);
    expect(resolved.weights).not.toBe(typography.weights);
  });

  test('resolvePartialTypography copies typography.sizes when the partial typography has an empty sizes property', () => {
    const resolved = resolvePartialTypography(typography, {
      sizes: {}
    });
    expect(resolved.sizes).toEqual(typography.sizes);
    expect(resolved.sizes).not.toBe(typography.sizes);
  });

  test('resolvePartialTypography returns a blend of the partial typography and the full typography', () => {
    const resolved = resolvePartialTypography(typography, partialTypography);
    expect(resolved).toEqual({
      families: {
        primary: 'Verdana',
        monospace: 'Courier New'
      },
      sizes: {
        xSmall: 5,
        xLarge: 16
      },
      weights: {
        light: '200',
        medium: '500',
        semiBold: '700'
      }
    });
  });
});

import { flattenStyle, mergeAndFlattenStyles, mergeStyles } from './mergeStyles';
import type { StyleProp } from './mergeStyles.types';

type OpaqueColorValue = symbol & { __TYPE__: 'Color' };
type ColorValue = string | OpaqueColorValue;

interface IFakeStyle {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  fontFamily?: string;
  borderWidth?: number;
  ':hover'?: IFakeStyle;
}

type IFakeStyleProp = StyleProp<IFakeStyle>;

const s1: IFakeStyleProp = [
  { backgroundColor: 'blue' },
  [{ color: 'red', borderWidth: 1 }, { fontFamily: 'segoe' }, [{ backgroundColor: 'bodyBackground' }]],
];

const s1flatten: IFakeStyleProp = {
  backgroundColor: 'bodyBackground',
  color: 'red',
  borderWidth: 1,
  fontFamily: 'segoe',
};

const s2: IFakeStyleProp = {
  borderWidth: 2,
  fontFamily: 'primary',
  color: 'bodyText',
};

const sMerged: IFakeStyleProp = {
  backgroundColor: 'bodyBackground',
  borderWidth: 2,
  fontFamily: 'primary',
  color: 'bodyText',
};

const sSelector: IFakeStyleProp = {
  borderWidth: 1,
  ':hover': {
    borderWidth: 2,
    fontFamily: 'primary',
  },
};

const sSelector2: IFakeStyleProp = {
  backgroundColor: 'white',
  ':hover': {
    backgroundColor: 'black',
    borderWidth: 3,
  },
};

const sArraySelector: IFakeStyleProp = [[sSelector]];

const sArraySelector2: IFakeStyleProp = [sSelector2];

const sMergedSelectors: IFakeStyleProp = {
  borderWidth: 1,
  backgroundColor: 'white',
  ':hover': {
    borderWidth: 3,
    fontFamily: 'primary',
    backgroundColor: 'black',
  },
};

describe('Style flatten and merge tests', () => {
  test('flatten recursive arrays', () => {
    const flattened = flattenStyle(s1);
    expect(flattened).toEqual(s1flatten);
    expect(flattened).not.toBe(s1);
  });

  test('flatten flat style returns style', () => {
    const flattened = flattenStyle(s2);
    expect(flattened).toBe(s2);
  });

  test('merge also flattens', () => {
    const merged = mergeAndFlattenStyles(undefined, undefined, s1, s2);
    expect(merged).toEqual(sMerged);
  });

  test('merge with sub objects', () => {
    const merged = mergeAndFlattenStyles(undefined, undefined, sSelector, sSelector2);
    expect(merged).toEqual(sMergedSelectors);
  });

  test('merge sub objects in arrays', () => {
    const merged = mergeAndFlattenStyles(undefined, undefined, sArraySelector, sArraySelector2);
    expect(merged).toEqual(sMergedSelectors);
  });

  test('memo recursive arrays', () => {
    const flattened = mergeStyles(s1);
    const flattened2 = mergeStyles(s1);
    expect(flattened).toEqual(s1flatten);
    expect(flattened2).toBe(flattened);
  });

  test('memo flat style', () => {
    const flattened = mergeStyles(s2);
    const flattened2 = mergeStyles(s2);
    expect(flattened).toBe(s2);
    expect(flattened2).toBe(flattened);
  });

  test('memo and flatten multiple', () => {
    const flattened = mergeStyles(s1, s2);
    const flattened2 = mergeStyles(s1, s2);
    expect(flattened).toEqual(sMerged);
    expect(flattened2).toBe(flattened);
  });

  test('memo styles ignores undefined values', () => {
    const result1 = mergeStyles(s1, s2, undefined, s1flatten);
    const result2 = mergeStyles(s1, undefined, s2, s1flatten);
    expect(result2).toBe(result1);
  });
});

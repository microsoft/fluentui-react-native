import { assignProps, assignStyles } from './assignProps';
import type { StyleProp } from '../types/props.types';

interface IFakeStyle {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  borderWidth?: number;
}

type IFakeStyleProp = StyleProp<IFakeStyle>;

describe('assignStyles', () => {
  test('returns undefined when there are no valid styles', () => {
    expect(assignStyles()).toBeUndefined();
    expect(assignStyles(undefined, null, false as unknown as IFakeStyleProp)).toBeUndefined();
  });

  test('returns a single style object directly, preserving identity', () => {
    const style: IFakeStyleProp = { color: 'red' };
    const result = assignStyles(style);
    expect(result).toBe(style);
  });

  test('returns a single style directly even when other args are falsy', () => {
    const style: IFakeStyleProp = { color: 'red' };
    const result = assignStyles(undefined, style, null);
    expect(result).toBe(style);
  });

  test('returns a single array argument directly, preserving identity', () => {
    const style: IFakeStyleProp = [{ color: 'red' }, { borderWidth: 1 }];
    const result = assignStyles(style);
    expect(result).toBe(style);
  });

  test('combines multiple style objects into a flat array without flattening values', () => {
    const a: IFakeStyleProp = { color: 'red' };
    const b: IFakeStyleProp = { backgroundColor: 'blue' };
    const result = assignStyles(a, b) as IFakeStyle[];
    expect(result).toEqual([a, b]);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  test('flattens nested arrays into a single flat array', () => {
    const a: IFakeStyleProp = { color: 'red' };
    const b: IFakeStyleProp = { backgroundColor: 'blue' };
    const c: IFakeStyleProp = { borderWidth: 2 };
    const result = assignStyles([a], [[b], c]) as IFakeStyle[];
    expect(result).toEqual([a, b, c]);
  });

  test('drops falsy entries while combining multiple styles', () => {
    const a: IFakeStyleProp = { color: 'red' };
    const b: IFakeStyleProp = { backgroundColor: 'blue' };
    const result = assignStyles(a, [null, undefined, b, false as unknown as IFakeStyleProp]) as IFakeStyle[];
    expect(result).toEqual([a, b]);
  });

  test('does not mutate the input styles', () => {
    const a: IFakeStyleProp = [{ color: 'red' }];
    const b: IFakeStyleProp = { backgroundColor: 'blue' };
    assignStyles(a, b);
    expect(a).toEqual([{ color: 'red' }]);
    expect((a as IFakeStyle[]).length).toBe(1);
  });
});

describe('assignProps', () => {
  test('mutates and returns the base object', () => {
    const base = { a: 1 };
    const result = assignProps(base, { b: 2 } as Partial<typeof base>);
    expect(result).toBe(base);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('later props override earlier props (last-wins)', () => {
    const base = { a: 1, b: 1 };
    const result = assignProps(base, { b: 2 }, { b: 3 });
    expect(result).toEqual({ a: 1, b: 3 });
  });

  test('returns a fresh object when the base is not an object', () => {
    const result = assignProps(null as unknown as { a?: number }, { a: 1 });
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBeNull();
  });

  test('returns a fresh object when the base is undefined', () => {
    const result = assignProps(undefined as unknown as { a?: number }, { a: 1 }, { b: 2 } as { a?: number });
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).toBeInstanceOf(Object);
  });

  test('ignores undefined and null entries in the rest arguments', () => {
    const base = { a: 1 } as { a: number; b?: number };
    const result = assignProps(base, undefined as unknown as Partial<typeof base>, { b: 2 }, null as unknown as Partial<typeof base>);
    expect(result).toBe(base);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('merges styles from base and rest into an array rather than replacing', () => {
    const baseStyle = { color: 'red' };
    const restStyle = { backgroundColor: 'blue' };
    const base = { style: baseStyle as IFakeStyleProp };
    const result = assignProps(base, { style: restStyle as IFakeStyleProp });
    expect(result.style).toEqual([baseStyle, restStyle]);
    expect(result).toBe(base);
  });

  test('keeps a single style intact when only the base has a style', () => {
    const baseStyle = { color: 'red' };
    const base = { style: baseStyle as IFakeStyleProp, a: 1 };
    const result = assignProps(base, { a: 2 } as Partial<typeof base>);
    expect(result.style).toBe(baseStyle);
    expect(result.a).toBe(2);
  });

  test('applies a style supplied only in rest', () => {
    const restStyle = { color: 'green' };
    const base = { a: 1 } as { a: number; style?: IFakeStyleProp };
    const result = assignProps(base, { style: restStyle as IFakeStyleProp });
    expect(result.style).toBe(restStyle);
    expect(result.a).toBe(1);
  });

  test('merged style wins over individually assigned style props', () => {
    const baseStyle = { color: 'red' };
    const restStyle = { color: 'blue' };
    const base = { style: baseStyle as IFakeStyleProp };
    const result = assignProps(base, { style: restStyle as IFakeStyleProp });
    // the combined array is applied last, so it is not clobbered by the raw rest style
    expect(result.style).toEqual([baseStyle, restStyle]);
  });

  test('combines styles from base and multiple rest props in order', () => {
    const baseStyle = { color: 'red' };
    const restStyle1 = { backgroundColor: 'blue' };
    const restStyle2 = { borderWidth: 2 };
    const base = { style: baseStyle as IFakeStyleProp };
    const result = assignProps(base, { style: restStyle1 as IFakeStyleProp }, { style: restStyle2 as IFakeStyleProp });
    expect(result.style).toEqual([baseStyle, restStyle1, restStyle2]);
  });

  test('flattens array-valued styles when combining base and rest', () => {
    const baseStyle: IFakeStyleProp = [{ color: 'red' }, { borderWidth: 1 }];
    const restStyle: IFakeStyleProp = { backgroundColor: 'blue' };
    const base = { style: baseStyle };
    const result = assignProps(base, { style: restStyle });
    expect(result.style).toEqual([{ color: 'red' }, { borderWidth: 1 }, { backgroundColor: 'blue' }]);
  });

  test('does not mutate the rest props objects', () => {
    const rest = { b: 2 };
    const base = { a: 1 } as { a: number; b?: number };
    assignProps(base, rest);
    expect(rest).toEqual({ b: 2 });
  });

  test('leaves the base untouched when no rest props are provided', () => {
    const base = { a: 1 };
    const result = assignProps(base);
    expect(result).toBe(base);
    expect(result).toEqual({ a: 1 });
  });
});

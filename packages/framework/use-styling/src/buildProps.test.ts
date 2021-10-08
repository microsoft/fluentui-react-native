import { getMemoCache } from '@fluentui-react-native/memo-cache';
import { buildProps } from './buildProps';

type ITheme = { foo?: string; bar?: string };
type ITokens = { a?: string; b?: string; c?: string; d?: string };
type IOuterProps = { banana?: string; potato?: string };
type IProps = ITokens & ITheme & IOuterProps & { instance: number };

const theme: ITheme = { foo: 'foo', bar: 'bar' };

let instanceCount = 0;

function munge(tokens: ITokens, theme: ITheme, props: IOuterProps): IProps {
  return {
    ...theme,
    ...tokens,
    ...props,
    instance: instanceCount++,
  };
}

describe('props function tests', () => {
  test('basic build props function caches as expected', () => {
    const cache = getMemoCache();
    const styleFn = buildProps(munge, ['a', 'b']);
    const p1 = styleFn({ a: 'a', b: 'b', c: 'c' }, theme, undefined, cache);
    expect(styleFn({ a: 'a', b: 'b', c: 'foo' }, theme, undefined, cache)).toBe(p1);
    const p2 = styleFn({ a: 'b', b: 'b' }, theme, undefined, cache);
    expect(p2).not.toBe(p1);
    expect(styleFn({ a: 'b', b: 'b', c: 'bar' }, theme, undefined, cache)).toBe(p2);
  });

  test('build props function refinement works with explicit keys', () => {
    const cache = getMemoCache();
    const styleFn = buildProps(munge, ['a', 'b', 'c', 'd']);
    const refinedFn = styleFn.refine(['a', 'b']);
    const t1 = { a: 'a', b: 'b', c: 'c', d: 'd' };
    const t2 = { a: 'a', b: 'b', c: 'foo', d: 'bar' };

    const p1 = styleFn(t1, theme, undefined, cache);
    const p2 = styleFn(t2, theme, undefined, cache);
    expect(p2).not.toBe(p1);

    const rp1 = refinedFn(t1, theme, undefined, cache);
    const rp2 = refinedFn(t2, theme, undefined, cache);
    expect(rp2).toBe(rp1);
  });

  test('build props with outer props function caches as expected', () => {
    const cache = getMemoCache();
    const styleFn = buildProps(munge, ['a', 'b', 'banana']);
    const p1 = styleFn({ a: 'a', b: 'b', c: 'c' }, theme, { banana: 'banana' }, cache);
    expect(styleFn({ a: 'a', b: 'b', c: 'foo' }, theme, { banana: 'banana', potato: 'potato' }, cache)).toBe(p1);
    const p2 = styleFn({ a: 'b', b: 'b' }, theme, { banana: 'potato' }, cache);
    expect(p2).not.toBe(p1);
    expect(styleFn({ a: 'b', b: 'b', c: 'bar' }, theme, { banana: 'potato', potato: 'potato' }, cache)).toBe(p2);
  });
});

import { getMemoCache } from '@fluentui-react-native/framework-base/memo-cache';

import { buildProps } from './buildProps';

type ITheme = { foo?: string; bar?: string };
type ITokens = { a?: string; b?: string; c?: string; d?: string };
type IProps = ITokens & ITheme & { instance: number };

const theme: ITheme = { foo: 'foo', bar: 'bar' };

let instanceCount = 0;

function munge(tokens: ITokens, theme: ITheme): IProps {
  return {
    ...theme,
    ...tokens,
    instance: instanceCount++,
  };
}

describe('props function tests', () => {
  test('basic build props function caches as expected', () => {
    const cache = getMemoCache();
    const styleFn = buildProps(munge, ['a', 'b']);
    const p1 = styleFn({ a: 'a', b: 'b', c: 'c' }, theme, cache);
    expect(styleFn({ a: 'a', b: 'b', c: 'foo' }, theme, cache)).toBe(p1);
    const p2 = styleFn({ a: 'b', b: 'b' }, theme, cache);
    expect(p2).not.toBe(p1);
    expect(styleFn({ a: 'b', b: 'b', c: 'bar' }, theme, cache)).toBe(p2);
  });

  test('build props function refinement works with explicit keys', () => {
    const cache = getMemoCache();
    const styleFn = buildProps(munge, ['a', 'b', 'c', 'd']);
    const refinedFn = styleFn.refine(['a', 'b']);
    const t1 = { a: 'a', b: 'b', c: 'c', d: 'd' };
    const t2 = { a: 'a', b: 'b', c: 'foo', d: 'bar' };

    const p1 = styleFn(t1, theme, cache);
    const p2 = styleFn(t2, theme, cache);
    expect(p2).not.toBe(p1);

    const rp1 = refinedFn(t1, theme, cache);
    const rp2 = refinedFn(t2, theme, cache);
    expect(rp2).toBe(rp1);
  });
});

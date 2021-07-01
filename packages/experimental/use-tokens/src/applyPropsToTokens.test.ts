import { applyPropsToTokens } from './applyPropsToTokens';
import { getMemoCache } from '@fluentui-react-native/memo-cache';

interface Tokens {
  uno?: string;
  dos?: string;
  tres?: number;
  quatro?: string | number;
  cinco?: boolean;
}

type TokenProps = Pick<Tokens, 'dos' | 'quatro' | 'cinco'>;
const tokenProps: (keyof TokenProps)[] = ['dos', 'quatro', 'cinco'];

interface Props extends TokenProps {
  foo?: string;
  bar?: string;
}

const themeTokens: Tokens = {
  uno: 'uno',
  dos: 'dos',
  tres: 3,
  quatro: 4,
  cinco: true,
};

const props1: Props = { dos: 'two', quatro: 'four', cinco: false, foo: 'foo', bar: 'bar' };
// const props2: Props = { dos: 'two' };
// const props3: Props = { foo: 'foo', bar: 'bar' };

/*
export function applyPropsToTokens<TProps, TTokens>(
  props: TProps,
  tokens: TTokens,
  cache: GetMemoValue<TTokens>,
  keys: (keyof TTokens)[],
): [TTokens, GetMemoValue<TTokens>] {
  for (const key of keys) {
    const sourceValue = props[key as string];
    const setValue = sourceValue === tokens[key] ? undefined : sourceValue;
    [tokens, cache] = cache(() => (setValue === undefined ? tokens : { ...tokens, [key]: setValue }), [setValue]);
  }
  return [tokens, cache];
}
*/

describe('applyPropsToTokens tests', () => {
  test('props get copied', () => {
    const cache = getMemoCache();
    const [tokens] = applyPropsToTokens(props1, themeTokens, cache, tokenProps);
    expect(tokens).not.toBe(themeTokens);
    for (const key of tokenProps) {
      expect(tokens[key]).toEqual(props1[key]);
    }
  });

  test('no copied props does not change tokens', () => {
    const cache = getMemoCache();
    const [tokens, subCache] = applyPropsToTokens({}, themeTokens, cache, tokenProps);
    expect(tokens).toBe(themeTokens);
    expect(subCache).toBe(cache);
  });
});

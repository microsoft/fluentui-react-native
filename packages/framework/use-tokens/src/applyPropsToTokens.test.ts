import { getMemoCache } from '@fluentui-react-native/framework-base/memo-cache';

import { applyPropsToTokens } from './applyPropsToTokens';

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
    const [tokens] = applyPropsToTokens({}, themeTokens, cache, tokenProps);
    expect(tokens).toBe(themeTokens);
  });
});

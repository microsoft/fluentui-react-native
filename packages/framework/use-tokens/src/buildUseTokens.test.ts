import { buildUseTokens } from './buildUseTokens';

interface Tokens {
  a?: string;
  b?: string;
  c?: string;
  hover?: Tokens;
  press?: Tokens;
}

const baseTokens: Tokens = {
  a: 'a-base',
  b: 'b-base',
  c: 'c-base',
  hover: {
    c: 'c-base-hover',
  },
  press: {
    c: 'c-base-press',
  },
};

interface Theme {
  vals: {
    foo?: string;
    bar?: string;
  };
  components: {
    [key: string]: Tokens;
  };
}

const defaultTheme: Theme = {
  vals: {
    foo: 'foo',
    bar: 'bar',
  },
  components: {
    uno: {
      a: 'uno-a',
      c: 'uno-c',
    },
    dos: {
      b: 'dos-b',
      c: 'dos-c',
    },
  },
};

const variantTheme: Theme = {
  vals: {
    foo: 'variant',
  },
  components: {},
};

const getComponentInfo = (theme: Theme, name: string) => theme.components[name];

const componentTokens = [baseTokens, 'uno', (theme: Theme) => ({ b: theme.vals.foo })];

const resolvedTokens: Tokens = {
  a: 'uno-a',
  b: 'foo',
  c: 'uno-c',
  hover: {
    c: 'c-base-hover',
  },
  press: {
    c: 'c-base-press',
  },
};

const variantTokens: Tokens = {
  a: 'a-base',
  b: 'variant',
  c: 'c-base',
  hover: {
    c: 'c-base-hover',
  },
  press: {
    c: 'c-base-press',
  },
};

describe('buildUseTokens test suite', () => {
  test('basic built hook', () => {
    const useTokens = buildUseTokens(getComponentInfo, ...componentTokens);
    const [tokens] = useTokens(defaultTheme);
    expect(tokens).toEqual(resolvedTokens);
  });

  test('multiple calls return same object', () => {
    const useTokens = buildUseTokens(getComponentInfo, ...componentTokens);
    const [tokens1] = useTokens(defaultTheme);
    const [tokens2] = useTokens(defaultTheme);
    expect(tokens1).toBe(tokens2);
  });

  test('variant theme is separate', () => {
    const useTokens = buildUseTokens(getComponentInfo, ...componentTokens);
    const [tokensDefault] = useTokens(defaultTheme);
    const [tokensVariant] = useTokens(variantTheme);
    expect(tokensVariant).not.toBe(tokensDefault);
    expect(tokensVariant).toEqual(variantTokens);
  });

  test('simple customization layers on top', () => {
    const useTokens = buildUseTokens(getComponentInfo, ...componentTokens);
    const useTokensCustom = useTokens.customize({ a: 'custom' });
    const [tokens] = useTokensCustom(defaultTheme);
    expect(tokens).toEqual({ ...resolvedTokens, a: 'custom' });
  });
});

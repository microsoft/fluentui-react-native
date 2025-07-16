import { getMemoCache } from '@fluentui-react-native/framework-base';

import { buildProps } from './buildProps';
import type { ThemeHelper, UseStylingOptions } from './buildUseStyling';
import { buildUseStyling } from './buildUseStyling';

let lastInstance = 0;

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

const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => defaultTheme,
  getComponentInfo: (theme: Theme, name: string) => theme.components[name],
};

interface Props {
  b?: string;
  p1?: number;
  p2?: string;
  style?: Tokens & {
    instance?: number;
    foo?: string;
    bar?: string;
    disabled?: boolean;
  };
}

const slotFn1 = (tokens: Tokens, theme: Theme) => {
  return {
    style: {
      a: tokens.a,
      b: tokens.b,
      c: tokens.c,
      ...theme.vals,
      instance: lastInstance++,
    },
  } as Props;
};

const extraCache = getMemoCache();

const slotFn2 = (tokens: Tokens) => {
  return extraCache(
    () => ({
      style: {
        a: tokens.a,
        b: tokens.b,
        instance: lastInstance++,
      },
    }),
    [tokens.a, tokens.b],
  )[0];
};

interface TestSlotProps {
  slot1: Props;
  slot2: Props;
  slot3: Props;
}

const baseOptions: UseStylingOptions<Props, TestSlotProps, Tokens, Theme> = {
  tokens: [
    baseTokens,
    'uno',
    (theme: Theme) => ({
      b: theme.vals.foo,
    }),
  ],
  states: ['hover', 'press'],
  slotProps: {
    slot1: {
      style: {
        instance: lastInstance++,
      },
    },
    slot2: buildProps(slotFn1, ['a', 'b', 'c']),
    slot3: slotFn2,
  },
  tokensThatAreAlsoProps: ['b'],
};

describe('useStyling test suite', () => {
  test('basic built hook', () => {
    const useStyling = buildUseStyling(baseOptions, themeHelper);
    const slotProps = useStyling({});
    const slotProps2 = useStyling({ p1: 2, p2: 'bar' });
    Object.keys(slotProps).forEach((key) => {
      expect(slotProps[key]).toBe(slotProps2[key]);
    });
  });
});

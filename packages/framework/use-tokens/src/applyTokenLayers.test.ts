import { getMemoCache } from '@fluentui-react-native/framework-base/memo-cache';

import { applyTokenLayers } from './applyTokenLayers';

type Tokens = {
  a?: string;
  b?: string;
  c?: string;
  hover?: Tokens;
  press?: Tokens;
  disabled?: Tokens;
};

const stateOrder = ['hover', 'press', 'disabled'];

const tokens1: Tokens = {
  a: 'a',
  b: 'b',
  c: 'c',
  hover: {
    a: 'a-hover',
    b: 'b-hover',
    press: {
      a: 'a-hover-press',
    },
  },
  press: {
    a: 'a-press',
    b: 'b-press',
  },
  disabled: {
    a: 'disabled',
    b: 'disabled',
    c: 'disabled',
  },
};

function stripLayers(tokens: Tokens): Tokens {
  const t = { ...tokens };
  delete t.hover;
  delete t.press;
  delete t.disabled;
  return t;
}

describe('applyLayers tests', () => {
  test('no layers returns tokens', () => {
    const cache = getMemoCache();
    const tokens = applyTokenLayers(tokens1, stateOrder, cache, () => false)[0];
    expect(tokens).toBe(tokens1);
  });

  test('apply hover works', () => {
    const cache = getMemoCache();
    const lookup = (layer) => layer === 'hover';
    const result1 = applyTokenLayers(tokens1, stateOrder, cache, lookup)[0];
    expect(applyTokenLayers(tokens1, stateOrder, cache, lookup)[0]).toBe(result1);
    expect(stripLayers(result1)).toEqual({ a: 'a-hover', b: 'b-hover', c: 'c' });
  });

  test('apply hover and press layer correctly', () => {
    const cache = getMemoCache();
    const lookup = (layer) => layer === 'hover' || layer === 'press';
    const result1 = applyTokenLayers(tokens1, stateOrder, cache, lookup)[0];
    expect(applyTokenLayers(tokens1, stateOrder, cache, lookup)[0]).toBe(result1);
    expect(stripLayers(result1)).toEqual({ a: 'a-hover-press', b: 'b-press', c: 'c' });
  });
});

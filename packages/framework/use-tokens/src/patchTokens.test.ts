import { getMemoCache } from '@fluentui-react-native/framework-base/memo-cache';

import { patchTokens } from './patchTokens';

interface Tokens {
  uno?: string;
  dos?: string;
  tres?: number;
  quatro?: string | number;
  cinco?: boolean;
}

const themeTokens: Tokens = {
  uno: 'uno',
  dos: 'dos',
  tres: 3,
  quatro: 4,
  cinco: true,
};

describe('patchTokens tests', () => {
  test('props get copied', () => {
    const cache = getMemoCache();
    const patchValues = { uno: 'one', quatro: 'quatro' };
    const [tokens] = patchTokens(themeTokens, cache, patchValues);
    expect(tokens).not.toBe(themeTokens);
    for (const key in patchValues) {
      expect(tokens[key]).toEqual(patchValues[key]);
    }
  });

  test('no copied props does not change tokens', () => {
    const cache = getMemoCache();
    const patchValues1 = {};
    const [tokens] = patchTokens(themeTokens, cache, patchValues1);
    expect(tokens).toBe(themeTokens);

    const patchValues2 = { tres: undefined };
    const [tokens2] = patchTokens(themeTokens, cache, patchValues2);
    expect(tokens2).toBe(themeTokens);
  });

  test('patching tokens cache independent of order', () => {
    const cache = getMemoCache();
    const patch1 = { uno: 'one', cinco: false };
    const patch2 = { cinco: false, uno: 'one' };
    const [tokens1] = patchTokens(themeTokens, cache, patch1);
    const [tokens2] = patchTokens(themeTokens, cache, patch2);
    expect(tokens1).toBe(tokens2);
  });
});

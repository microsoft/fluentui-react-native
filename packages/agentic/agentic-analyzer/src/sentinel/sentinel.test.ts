import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import type { Theme } from '@fluentui-react-native/theme-types';

import { resolveTokensForTheme } from '../tests/validate.ts';
import { createSentinelTheme } from './createSentinelTheme.ts';

describe('createSentinelTheme', () => {
  it('replaces every color leaf with a unique sentinel value', () => {
    const { theme, reverseMap } = createSentinelTheme(defaultFluentTheme);

    const colorValues = Object.values(theme.colors).filter((v) => typeof v === 'string') as string[];
    const uniqueValues = new Set(colorValues);
    // Every string color leaf must be unique.
    expect(uniqueValues.size).toBe(colorValues.length);
    // Every sentinel must round-trip through the reverse map.
    for (const value of colorValues) {
      expect(reverseMap.get(value)).toBe(`colors.${findColorKey(theme, value)}`);
    }
  });

  it('does not mutate the base theme', () => {
    const before = defaultFluentTheme.colors.buttonBackground;
    createSentinelTheme(defaultFluentTheme);
    expect(defaultFluentTheme.colors.buttonBackground).toBe(before);
  });
});

describe('resolveTokensForTheme', () => {
  it('maps a color token back to its semantic theme path', () => {
    const colorTokens = (t: Theme) => ({ backgroundColor: t.colors.buttonBackground });
    const resolved = resolveTokensForTheme({}, colorTokens);
    expect(resolved.backgroundColor).toBe('colors.buttonBackground');
  });

  it('deep-merges multiple token functions with later overriding earlier', () => {
    const first = (t: Theme) => ({ backgroundColor: t.colors.buttonBackground, nested: { color: t.colors.buttonText } });
    const second = (t: Theme) => ({ nested: { color: t.colors.buttonBorder } });
    const resolved = resolveTokensForTheme({}, first, second) as Record<string, any>;
    expect(resolved.backgroundColor).toBe('colors.buttonBackground');
    expect(resolved.nested.color).toBe('colors.buttonBorder');
  });

  it('leaves non-theme values (numbers, literal strings) unchanged', () => {
    const tokens = () => ({ padding: 12, width: '100%', variant: 'bodySemibold' });
    const resolved = resolveTokensForTheme({}, tokens);
    expect(resolved).toEqual({ padding: 12, width: '100%', variant: 'bodySemibold' });
  });

  it('accepts literal token objects as well as functions', () => {
    const resolved = resolveTokensForTheme({}, { iconSize: 16 });
    expect(resolved).toEqual({ iconSize: 16 });
  });

  it('returns a JSON-serializable plain object', () => {
    const tokens = (t: Theme) => ({ backgroundColor: t.colors.buttonBackground, padding: 8 });
    const resolved = resolveTokensForTheme({}, tokens);
    expect(JSON.parse(JSON.stringify(resolved))).toEqual(resolved);
  });
});

function findColorKey(theme: Theme, value: string): string | undefined {
  for (const [key, v] of Object.entries(theme.colors)) {
    if (v === value) {
      return key;
    }
  }
  return undefined;
}

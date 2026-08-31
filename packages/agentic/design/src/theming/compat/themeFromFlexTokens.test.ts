import { defaultFlexTokens } from '../../tokens/defaultTokens';
import type { FlexTokens } from '../../tokens/flex.types';
import type { PartialTheme } from '../types/Theme.types';

import { themeFromFlexTokens } from './themeFromFlexTokens';

const light = {
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;

function createTokens(): FlexTokens {
  const hover = { ...defaultFlexTokens.color.hover };
  delete hover.surfaceNeutralNear;

  return {
    ...defaultFlexTokens,
    color: {
      ...defaultFlexTokens.color,
      backgroundBrandSoft: '#111111',
      backgroundBrandSubtle: '#222222',
      backgroundNeutralSubtle: '#333333',
      surfaceNeutralNear: '#444444',
      fixedBlack: '#050505',
      expressionAchromaticHeavy: '#060606',
      hover,
    },
    borderRadius: {
      ...defaultFlexTokens.borderRadius,
      base200: 12,
      base300: 24,
    },
    fontWeight: {
      ...defaultFlexTokens.fontWeight,
      functionalSemibold: '700',
      contentBold: '900',
    },
  };
}

describe('themeFromFlexTokens', () => {
  it('merges the base, legacy fallback, mapped Flex values, and final appearance in order', () => {
    const fallback = {
      name: 'Host theme',
      colors: {
        brandBackground2: '#777777',
        customLegacyColor: '#abcdef',
      },
      components: {
        Button: {
          tokens: {
            borderRadius: 2,
            legacyOnlyMetric: 42,
          },
        },
      },
      host: {
        appearance: 'dynamic',
        palette: {
          Bkg: '#101010',
        },
        colors: {
          AppPrimary: '#202020',
        },
      },
    } as PartialTheme;

    const theme = themeFromFlexTokens(createTokens(), light, { fallback });

    expect(theme.name).toBe('Host theme');
    expect(theme.colors.customLegacyColor).toBe('#abcdef');
    expect(theme.colors.brandBackground2).toBe('#111111');
    expect(theme.colors.neutralBackground2).toBe('#444444');
    expect(theme.colors.neutralBackground2Hover).toBe('#444444');
    expect(theme.colors.black).toBe('#050505');
    expect(theme.components.Button.tokens).toMatchObject({
      borderRadius: 12,
      legacyOnlyMetric: 42,
    });
    expect(theme.host.palette?.Bkg).toBe('#101010');
    expect(theme.host.colors?.AppPrimary).toBe('#202020');
    expect(theme.host.appearance).toBe('light');
    expect(theme.typography.weights.semiBold).toBe('700');
  });

  it('uses declared canonical sources when several Flex roles share one legacy path', () => {
    const theme = themeFromFlexTokens(createTokens(), light);

    expect(theme.colors.brandBackground2).toBe('#111111');
    expect(theme.colors.neutralBackground2).toBe('#444444');
    expect(theme.colors.black).toBe('#050505');
    expect(theme.components.Button).toMatchObject({
      tokens: {
        borderRadius: 12,
      },
    });
    expect(theme.typography.weights.semiBold).toBe('700');
  });

  it('does not mutate frozen author inputs and returns a fresh legacy root', () => {
    const tokens = Object.freeze(createTokens());
    const fallback = Object.freeze({
      colors: Object.freeze({
        customLegacyColor: '#abcdef',
      }),
    }) as PartialTheme;

    const first = themeFromFlexTokens(tokens, light, { fallback });
    const second = themeFromFlexTokens(tokens, light, { fallback });

    expect(first).not.toBe(second);
    expect(first.colors.customLegacyColor).toBe('#abcdef');
    expect(tokens.color.surfaceNeutralNear).toBe('#444444');
  });
});

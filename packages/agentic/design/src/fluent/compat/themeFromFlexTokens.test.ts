import { createInteractiveColor } from '../../flex/colors/interactiveColor';
import { defaultFlexTokens } from '../../flex/defaults/defaultTokens';
import type { FlexTokens, SemanticColorTokenValues } from '../../flex/tokens.types';
import { restColorValues } from '../../test/fixtures/interactionColors';
import type { PartialTheme } from '../types/Theme.types';

import { getDefaultLegacyTheme } from './defaultLegacyTheme';
import { themeFromFlexTokens } from './themeFromFlexTokens';
import type { FlatFlexTokens } from './themeFromFlexTokens';

const light = {
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;

function solid(value: string) {
  return createInteractiveColor(value, value, value);
}

function createTokens(): FlexTokens {
  return {
    ...defaultFlexTokens,
    color: {
      ...defaultFlexTokens.color,
      backgroundBrandSoft: solid('#111111'),
      backgroundBrandSubtle: solid('#222222'),
      backgroundNeutralSubtle: solid('#333333'),
      surfaceNeutralNear: createInteractiveColor('#444444', '#454545', '#464646'),
      fixedBlack: solid('#050505'),
      expressionAchromaticHeavy: solid('#060606'),
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
    expect(theme.colors.neutralBackground2Hover).toBe('#454545');
    expect(theme.colors.neutralBackground2Pressed).toBe('#464646');
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
    expect(tokens.color.surfaceNeutralNear.rest).toBe('#444444');
  });

  it('accepts the deprecated flat representation with optional state maps', () => {
    const color: FlatFlexTokens['color'] = {
      ...restColorValues(defaultFlexTokens.color),
      surfaceNeutralNear: '#444444',
      backgroundBrandHeavy: '#0f6cbd',
      hover: { backgroundBrandHeavy: '#115ea3' } satisfies Partial<SemanticColorTokenValues>,
    };
    const flat: FlatFlexTokens = { ...defaultFlexTokens, color };

    const theme = themeFromFlexTokens(flat, light);

    expect(theme.colors.neutralBackground2).toBe('#444444');
    expect(theme.colors.neutralBackground2Hover).toBe('#444444');
    expect(theme.colors.brandBackground).toBe('#0f6cbd');
    expect(theme.colors.brandBackgroundHover).toBe('#115ea3');
    expect(theme.colors.brandBackgroundPressed).toBe('#0f6cbd');
  });

  it('projects layered shadows lossily to legacy { ambient, key } shadows', () => {
    const contour = { x: 0, y: 0, blur: 2, color: '#0000001a' };
    const middle = { x: 0, y: 1, blur: 2, color: '#0000000d' };
    const keyLayer = { x: 0, y: 4, blur: 8, color: '#00000014' };
    const tokens: FlexTokens = {
      ...createTokens(),
      shadow: { ...defaultFlexTokens.shadow, lowest: [contour, middle, keyLayer], lower: [keyLayer], low: [] },
    };

    const theme = themeFromFlexTokens(tokens, light);

    expect(theme.shadows.shadow2).toEqual({ ambient: contour, key: keyLayer });
    expect(theme.shadows.shadow4).toEqual({ ambient: keyLayer, key: keyLayer });
    expect(theme.shadows.shadow8).toEqual(getDefaultLegacyTheme(light).shadows.shadow8);
    expect(theme.shadows.shadow16).toEqual({ ambient: defaultFlexTokens.shadow.high[0], key: defaultFlexTokens.shadow.high.at(-1) });
  });

  it('passes a legacy { ambient, key } shadow through the deprecated flat representation', () => {
    const legacy = { ambient: { x: 0, y: 0, blur: 2, color: 'black' }, key: { x: 0, y: 2, blur: 4, color: 'red' } };
    const flat = {
      ...defaultFlexTokens,
      color: restColorValues(defaultFlexTokens.color),
      shadow: { ...defaultFlexTokens.shadow, lowest: legacy },
    };

    expect(themeFromFlexTokens(flat as unknown as FlatFlexTokens, light).shadows.shadow2).toEqual(legacy);
  });

  it('projects the same legacy theme from resolved and equivalent flat tokens', () => {
    const resolved = themeFromFlexTokens(defaultFlexTokens, light);
    const values = restColorValues(defaultFlexTokens.color);
    const flat: FlatFlexTokens = {
      ...defaultFlexTokens,
      color: {
        ...values,
        hover: Object.fromEntries(Object.entries(defaultFlexTokens.color).map(([name, entry]) => [name, entry.hover])),
        pressed: Object.fromEntries(Object.entries(defaultFlexTokens.color).map(([name, entry]) => [name, entry.pressed])),
      },
    };

    expect(themeFromFlexTokens(flat, light)).toEqual(resolved);
  });
});

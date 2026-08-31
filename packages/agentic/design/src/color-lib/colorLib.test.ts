import { PlatformColor } from 'react-native';

import {
  x3BebopWarmInteractionConformance,
  x3InteractionConformance,
  x3WarmVariantDeviations,
} from '../color-validation/testing/x3InteractionConformance';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import type { SemanticColorTokenValues } from '../tokens/flex.types';
import {
  compositeColor,
  compositeRgba,
  getContrastRatio,
  getHoverColor,
  getInteractionColor,
  getInteractionColorOverrides,
  getInteractionColors,
  getPressColor,
  INTERACTIVE_COLOR_TOKENS,
  isInverseInteractionToken,
  oklchToRgb,
  parseColorValue,
  resolveContrastColors,
  rgbaToHex,
  rgbToOklch,
} from './index';
import type { ColorMode, InteractionColorState } from './index';

const modeIndexes = {
  light: { rest: 0, hover: 1, pressed: 2 },
  dark: { rest: 3, hover: 4, pressed: 5 },
} as const;

function conformanceColors(mode: ColorMode): SemanticColorTokenValues {
  const { hover: _hover, pressed: _pressed, ...colors } = defaultFlexTokens.color;
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = x3InteractionConformance[token][modeIndexes[mode].rest];
  }
  return colors;
}

function getStateColor(
  state: InteractionColorState,
  color: string,
  token: (typeof INTERACTIVE_COLOR_TOKENS)[number],
  mode: ColorMode,
  variant: 'default' | 'bebopWarm',
) {
  return state === 'hover' ? getHoverColor(color, token, mode, { variant }) : getPressColor(color, token, mode, { variant });
}

describe('color parsing and conversion', () => {
  it('parses supported literal formats', () => {
    expect(parseColorValue('#1238')).toEqual({
      status: 'resolved',
      color: {
        r: 0x11 / 255,
        g: 0x22 / 255,
        b: 0x33 / 255,
        a: 0x88 / 255,
      },
    });
    expect(parseColorValue('rgb(100% 0% 50% / 25%)')).toEqual({
      status: 'resolved',
      color: { r: 1, g: 0, b: 0.5, a: 0.25 },
    });
  });

  it('formats RGBA and round-trips RGB through OKLCH', () => {
    expect(rgbaToHex({ r: 1, g: 0.5, b: 0, a: 0.5 })).toBe('#ff800080');

    const source = { r: 0.1, g: 0.4, b: 0.8 };
    const roundTrip = oklchToRgb(rgbToOklch(source));
    expect(roundTrip.r).toBeCloseTo(source.r, 6);
    expect(roundTrip.g).toBeCloseTo(source.g, 6);
    expect(roundTrip.b).toBeCloseTo(source.b, 6);
  });

  it('returns diagnostics for unsupported and native colors', () => {
    expect(parseColorValue('red')).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'unsupported-color-format' },
    });
    expect(parseColorValue(PlatformColor('labelColor'))).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'non-literal-color' },
    });
  });
});

describe('color compositing and contrast', () => {
  it('composites normalized and literal colors', () => {
    expect(compositeRgba({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 1, g: 1, b: 1, a: 1 })).toEqual({
      r: 0.5,
      g: 0.5,
      b: 0.5,
      a: 1,
    });
    expect(compositeColor('#0000000d', '#ffffff')).toBe('#f2f2f2');
    expect(compositeColor('rgba(255 0 0 / 50%)', '#000000')).toBe('#800000');
  });

  it('resolves effective colors and their WCAG ratio', () => {
    expect(resolveContrastColors('#00000080', '#ffffff')).toEqual({
      ratio: expect.closeTo(4.0041, 4),
      foregroundResolved: '#7f7f7f',
      backgroundResolved: '#ffffff',
    });
    expect(getContrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('rejects unsupported direct operations', () => {
    expect(() => compositeColor('red', '#ffffff')).toThrow('Unsupported color literal');
    expect(() => compositeColor('#00000080', '#ffffff80')).toThrow('background color must be opaque');
    expect(() => getContrastRatio('#000000', '#ffffff', '#ffffff80')).toThrow('fallback surface must be opaque');
  });
});

describe.each(['light', 'dark'] as const)('%s interaction colors', (mode) => {
  it.each(INTERACTIVE_COLOR_TOKENS)('matches default and Bebop Warm output for %s', (token) => {
    const vector = x3InteractionConformance[token];
    const warmVector = x3BebopWarmInteractionConformance[token];
    for (const state of ['hover', 'pressed'] as const) {
      const deviationKey = `${token}.${state}.${mode}` as keyof typeof x3WarmVariantDeviations;
      const deviation = x3WarmVariantDeviations[deviationKey];
      const upstreamValue = vector[modeIndexes[mode][state]];
      const warmValue = warmVector[modeIndexes[mode][state]];

      expect(getStateColor(state, vector[modeIndexes[mode].rest], token, mode, 'default')).toEqual({
        status: 'derived',
        value: deviation?.defaultValue ?? upstreamValue,
      });
      expect(getStateColor(state, warmVector[modeIndexes[mode].rest], token, mode, 'bebopWarm')).toEqual({
        status: 'derived',
        value: warmValue,
      });
      if (deviation) {
        expect(upstreamValue).toBe(deviation.warmValue);
      }
    }
  });

  it('generates a complete override map', () => {
    const colors = conformanceColors(mode);
    for (const token of INTERACTIVE_COLOR_TOKENS) {
      colors[token] = x3BebopWarmInteractionConformance[token][modeIndexes[mode].rest];
    }
    const result = getInteractionColorOverrides(colors, mode, 'hover', { variant: 'bebopWarm' });

    expect(result.diagnostics).toEqual([]);
    expect(Object.keys(result.overrides)).toHaveLength(59);
  });
});

describe('interaction color API', () => {
  it('classifies every inverse token with the upstream heavy/loud/onloud rule', () => {
    const expected = [
      'backgroundNeutralHeavy',
      'backgroundNeutralLoud',
      'backgroundBrandHeavy',
      'backgroundBrandLoud',
      'backgroundDangerLoud',
      'backgroundWarningLoud',
      'backgroundSuccessLoud',
      'strokeNeutralHeavy',
      'strokeNeutralLoud',
      'strokeNeutralOnloud',
      'strokeBrandLoud',
      'strokeBrandOnloud',
      'strokeDangerLoud',
      'strokeDangerOnloud',
      'strokeWarningLoud',
      'strokeWarningOnloud',
      'strokeSuccessLoud',
      'strokeSuccessOnloud',
      'foregroundNeutralOnloud',
      'foregroundBrandOnloud',
      'foregroundDangerOnloud',
      'foregroundWarningOnloud',
      'foregroundSuccessOnloud',
    ];

    expect(INTERACTIVE_COLOR_TOKENS.filter(isInverseInteractionToken)).toEqual(expected);
    expect(INTERACTIVE_COLOR_TOKENS).toHaveLength(59);
    expect(Object.keys(x3WarmVariantDeviations)).toHaveLength(10);
  });

  it('fills missing values without replacing authored interaction colors', () => {
    const input = {
      ...conformanceColors('light'),
      hover: { surfaceNeutralFarther: '#123456' },
    };
    const result = getInteractionColors(input, 'light');

    expect(result.colors.hover.surfaceNeutralFarther).toBe('#123456');
    expect(result.colors.hover.surfaceNeutralFar).toBe('#e8e8e8');
    expect(result.colors.pressed.surfaceNeutralFarther).toBe('#d7d7d7');
    expect(result.diagnostics).toEqual([]);
  });

  it('preserves identity when every interaction value is authored', () => {
    const colors = conformanceColors('light');
    const hover = getInteractionColorOverrides(colors, 'light', 'hover').overrides;
    const pressed = getInteractionColorOverrides(colors, 'light', 'pressed').overrides;
    const input = { ...colors, hover, pressed };

    expect(getInteractionColors(input, 'light').colors).toBe(input);
  });

  it('reports opaque platform colors instead of deriving a wrong value', () => {
    expect(getInteractionColor(PlatformColor('labelColor'), 'foregroundNeutralPrimary', 'light', 'hover')).toMatchObject({
      status: 'unresolvable',
      diagnostic: {
        reason: 'non-literal-color',
        token: 'foregroundNeutralPrimary',
        state: 'hover',
      },
    });
  });

  it('reports malformed literals', () => {
    expect(getPressColor('rgb(12oops 0 0)', 'foregroundDangerPrimary', 'light')).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'unsupported-color-format' },
    });
  });
});

import { PlatformColor } from 'react-native';

import { getInteractionColorOverrides } from '../../test/fixtures/interactionColors';
import {
  x3BebopWarmInteractionConformance,
  x3InteractionConformance,
  x3WarmToneDeviations,
} from '../../test/fixtures/x3InteractionConformance';
import type { InteractionConformanceVector } from '../../test/fixtures/x3InteractionConformance';
import type { ColorMode } from '../../color-lib/types';
import type { ColorTone, NormalizedThemeAppearance } from '../../types/appearance.types';
import { defaultFlexTokens } from '../defaults/defaultTokens';
import type { SemanticColors, SemanticColorTokenValues } from '../tokens.types';
import { deriveInteractionColor, withDerivedInteractionColors } from './interactionPolicy';
import {
  getInteractionCompositing,
  getInteractionDirection,
  INTERACTIVE_COLOR_TOKENS,
  isInverseInteractionToken,
} from './interactiveTokens';
import type { InteractiveColorToken } from './interactiveTokens';

const modeIndexes = {
  light: { rest: 0, hover: 1, pressed: 2 },
  dark: { rest: 3, hover: 4, pressed: 5 },
} as const;

function appearance(colorScheme: ColorMode, colorTone: ColorTone = 'cool'): NormalizedThemeAppearance {
  return { colorScheme, contrast: 'standard', interfaceLevel: 'base', colorTone };
}

function restColors(
  mode: ColorMode,
  conformance: Readonly<Record<InteractiveColorToken, InteractionConformanceVector>> = x3InteractionConformance,
): SemanticColors {
  const colors: SemanticColorTokenValues = { ...defaultFlexTokens.color };
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = conformance[token][modeIndexes[mode].rest];
  }
  return { ...colors, hover: {}, pressed: {} };
}

describe('interactive token classification', () => {
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
    expect(INTERACTIVE_COLOR_TOKENS.filter((token) => getInteractionDirection(token) === 'inverted')).toEqual(expected);
    expect(INTERACTIVE_COLOR_TOKENS).toHaveLength(59);
    expect(Object.keys(x3WarmToneDeviations)).toHaveLength(10);
  });

  it('composites only background and stroke tokens against the warm backdrop', () => {
    for (const token of INTERACTIVE_COLOR_TOKENS) {
      const expected = token.startsWith('background') || token.startsWith('stroke') ? 'backdrop' : 'direct';
      expect([token, getInteractionCompositing(token)]).toEqual([token, expected]);
    }
  });
});

describe.each(['light', 'dark'] as const)('%s Flex interaction policy', (mode) => {
  it.each(INTERACTIVE_COLOR_TOKENS)('matches the cool and warm conformance values for %s', (token) => {
    const vector = x3InteractionConformance[token];
    const warmVector = x3BebopWarmInteractionConformance[token];
    for (const state of ['hover', 'pressed'] as const) {
      const deviationKey = `${token}.${state}.${mode}` as keyof typeof x3WarmToneDeviations;
      const deviation = x3WarmToneDeviations[deviationKey];
      const upstreamValue = vector[modeIndexes[mode][state]];

      expect(deriveInteractionColor(vector[modeIndexes[mode].rest], token, state, appearance(mode))).toBe(
        deviation?.defaultValue ?? upstreamValue,
      );
      expect(deriveInteractionColor(warmVector[modeIndexes[mode].rest], token, state, appearance(mode, 'warm'))).toBe(
        warmVector[modeIndexes[mode][state]],
      );
      if (deviation) {
        expect(upstreamValue).toBe(deviation.warmValue);
      }
    }
  });

  it.each(['cool', 'warm'] as const)('derives a complete %s override map', (colorTone) => {
    const conformance = colorTone === 'warm' ? x3BebopWarmInteractionConformance : x3InteractionConformance;
    const result = getInteractionColorOverrides(restColors(mode, conformance), mode, 'hover', colorTone);

    expect(result.diagnostics).toEqual([]);
    expect(Object.keys(result.overrides)).toHaveLength(59);
  });
});

describe('deriveInteractionColor', () => {
  it('returns rest in high contrast', () => {
    expect(
      deriveInteractionColor('#ebebeb', 'surfaceNeutralFarther', 'hover', { ...appearance('light', 'warm'), contrast: 'highContrast' }),
    ).toBe('#ebebeb');
  });

  it('returns the same rest value when the engine cannot resolve it', () => {
    const rest = PlatformColor('labelColor');

    expect(deriveInteractionColor(rest, 'foregroundNeutralPrimary', 'pressed', appearance('dark'))).toBe(rest);
  });

  it('does not swallow unexpected engine failures', () => {
    jest.isolateModules(() => {
      jest.doMock('../../color-lib/interaction', () => ({
        getInteractionColor: () => {
          throw new Error('engine failure');
        },
      }));
      const policy = require('./interactionPolicy') as typeof import('./interactionPolicy');

      expect(() => policy.deriveInteractionColor('#ebebeb', 'surfaceNeutralFarther', 'hover', appearance('light'))).toThrow(
        'engine failure',
      );
    });
  });
});

describe('withDerivedInteractionColors', () => {
  it('fills omitted states without replacing authored values', () => {
    const input = { ...restColors('light'), hover: { surfaceNeutralFarther: '#123456' } };
    const result = withDerivedInteractionColors(input, appearance('light'));

    expect(result).not.toBe(input);
    expect(result.hover.surfaceNeutralFarther).toBe('#123456');
    expect(result.hover.surfaceNeutralFar).toBe('#e8e8e8');
    expect(result.pressed.surfaceNeutralFarther).toBe('#d7d7d7');
    expect(Object.keys(result.hover)).toHaveLength(59);
    expect(Object.keys(result.pressed)).toHaveLength(59);
    expect(input.hover).toEqual({ surfaceNeutralFarther: '#123456' });
  });

  it('preserves identity when every interaction value is authored', () => {
    const colors = restColors('light');
    const input = {
      ...colors,
      hover: getInteractionColorOverrides(colors, 'light', 'hover').overrides,
      pressed: getInteractionColorOverrides(colors, 'light', 'pressed').overrides,
    };

    expect(withDerivedInteractionColors(input, appearance('light'))).toBe(input);
  });

  it('uses the appearance tone', () => {
    const colors = restColors('light', x3BebopWarmInteractionConformance);
    const result = withDerivedInteractionColors(colors, appearance('light', 'warm'));

    expect(result.hover.backgroundNeutralTranslucent).toBe(x3BebopWarmInteractionConformance.backgroundNeutralTranslucent[1]);
  });

  it('skips tokens without a rest value', () => {
    const { surfaceNeutralFarther: _omitted, ...colors } = restColors('dark');
    const result = withDerivedInteractionColors(colors as SemanticColors, appearance('dark'));

    expect(result.hover).not.toHaveProperty('surfaceNeutralFarther');
    expect(result.pressed).not.toHaveProperty('surfaceNeutralFarther');
    expect(Object.keys(result.hover)).toHaveLength(58);
  });
});

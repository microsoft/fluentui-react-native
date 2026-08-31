import { PlatformColor } from 'react-native';

import { x3InteractionConformance, x3WarmVariantDeviations } from '../color/x3InteractionConformance.test.fixture';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import type { SemanticColorTokenValues } from '../tokens/flex.types';
import {
  deriveInteractionColor,
  deriveInteractionColorOverrides,
  deriveInteractionColors,
  INTERACTIVE_COLOR_TOKENS,
  isInverseInteractionToken,
} from './index';

const modeIndexes = {
  light: { rest: 0, hover: 1, pressed: 2 },
  dark: { rest: 3, hover: 4, pressed: 5 },
} as const;

function conformanceColors(mode: 'light' | 'dark'): SemanticColorTokenValues {
  const { hover: _hover, pressed: _pressed, ...colors } = defaultFlexTokens.color;
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = x3InteractionConformance[token][modeIndexes[mode].rest];
  }
  return colors;
}

describe.each(['light', 'dark'] as const)('%s interaction colors', (mode) => {
  it.each(INTERACTIVE_COLOR_TOKENS)('matches x3 for %s', (token) => {
    const vector = x3InteractionConformance[token];
    for (const state of ['hover', 'pressed'] as const) {
      const result = deriveInteractionColor(vector[modeIndexes[mode].rest], token, mode, state);
      const deviationKey = `${token}.${state}.${mode}` as keyof typeof x3WarmVariantDeviations;
      const deviation = x3WarmVariantDeviations[deviationKey];
      const expected = deviation?.defaultValue ?? vector[modeIndexes[mode][state]];

      expect(result).toEqual({
        status: 'derived',
        value: expected,
      });
      if (deviation) {
        expect(vector[modeIndexes[mode][state]]).toBe(deviation.warmValue);
      }
    }
  });

  it('derives a complete override map', () => {
    const result = deriveInteractionColorOverrides(conformanceColors(mode), mode, 'hover');

    expect(result.diagnostics).toEqual([]);
    expect(Object.keys(result.overrides)).toHaveLength(59);
  });
});

describe('interaction color contract', () => {
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

  it('supports rgb and rgba literals', () => {
    expect(deriveInteractionColor('rgb(235 235 235)', 'surfaceNeutralFarther', 'light', 'hover')).toEqual({
      status: 'derived',
      value: '#e1e1e1',
    });
    expect(deriveInteractionColor('rgba(0, 0, 0, 0.05)', 'backgroundNeutralSubtle', 'light', 'hover')).toEqual({
      status: 'derived',
      value: '#00000017',
    });
  });

  it('fills missing values without replacing authored interaction colors', () => {
    const input = {
      ...conformanceColors('light'),
      hover: { surfaceNeutralFarther: '#123456' },
    };
    const result = deriveInteractionColors(input, 'light');

    expect(result.colors.hover.surfaceNeutralFarther).toBe('#123456');
    expect(result.colors.hover.surfaceNeutralFar).toBe('#e8e8e8');
    expect(result.colors.pressed.surfaceNeutralFarther).toBe('#d7d7d7');
    expect(result.diagnostics).toEqual([]);
  });

  it('preserves identity when every interaction value is authored', () => {
    const colors = conformanceColors('light');
    const hover = deriveInteractionColorOverrides(colors, 'light', 'hover').overrides;
    const pressed = deriveInteractionColorOverrides(colors, 'light', 'pressed').overrides;
    const input = { ...colors, hover, pressed };

    expect(deriveInteractionColors(input, 'light').colors).toBe(input);
  });

  it('reports opaque platform colors instead of deriving a wrong value', () => {
    const platformColor = PlatformColor('labelColor');
    const result = deriveInteractionColor(platformColor, 'foregroundNeutralPrimary', 'light', 'hover');

    expect(result).toMatchObject({
      status: 'unresolvable',
      diagnostic: {
        reason: 'non-literal-color',
        token: 'foregroundNeutralPrimary',
        state: 'hover',
      },
    });
  });

  it('reports unsupported literal formats', () => {
    const result = deriveInteractionColor('red', 'foregroundDangerPrimary', 'light', 'pressed');
    const malformed = deriveInteractionColor('rgb(12oops 0 0)', 'foregroundDangerPrimary', 'light', 'pressed');

    expect(result).toMatchObject({
      status: 'unresolvable',
      diagnostic: {
        reason: 'unsupported-color-format',
      },
    });
    expect(malformed).toMatchObject({
      status: 'unresolvable',
      diagnostic: {
        reason: 'unsupported-color-format',
      },
    });
  });
});

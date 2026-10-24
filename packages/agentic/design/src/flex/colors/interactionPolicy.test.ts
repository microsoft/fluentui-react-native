import { PlatformColor } from 'react-native';

import { getInteractionColorOverrides, restColorValues } from '../../test/fixtures/interactionColors';
import {
  x3BebopWarmInteractionConformance,
  x3InteractionConformance,
  x3WarmToneDeviations,
} from '../../test/fixtures/x3InteractionConformance';
import type { InteractionConformanceVector } from '../../test/fixtures/x3InteractionConformance';
import type { ColorMode } from '../../color-lib/types';
import type { ColorTone, NormalizedThemeAppearance } from '../../types/appearance.types';
import { defaultFlexTokenDescription, defaultFlexTokens } from '../defaults/defaultTokens';
import type { SemanticColorTokenValues } from '../tokens.types';
import { normalizeFlexColor } from './flexColor';
import { deriveInteractionColor, resolveFlexColor, resolveFlexTokenDescription } from './interactionPolicy';
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
): SemanticColorTokenValues {
  const colors = restColorValues(defaultFlexTokens.color);
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = conformance[token][modeIndexes[mode].rest];
  }
  return colors;
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

      const direction = getInteractionDirection(token);

      expect(deriveInteractionColor(vector[modeIndexes[mode].rest], token, state, direction, appearance(mode))).toBe(
        deviation?.defaultValue ?? upstreamValue,
      );
      expect(deriveInteractionColor(warmVector[modeIndexes[mode].rest], token, state, direction, appearance(mode, 'warm'))).toBe(
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
      deriveInteractionColor('#ebebeb', 'surfaceNeutralFarther', 'hover', 'standard', {
        ...appearance('light', 'warm'),
        contrast: 'highContrast',
      }),
    ).toBe('#ebebeb');
  });

  it('returns the same rest value when the engine cannot resolve it', () => {
    const rest = PlatformColor('labelColor');

    expect(deriveInteractionColor(rest, 'foregroundNeutralPrimary', 'pressed', 'standard', appearance('dark'))).toBe(rest);
  });

  it('does not swallow unexpected engine failures', () => {
    jest.isolateModules(() => {
      jest.doMock('../../color-lib/interaction', () => ({
        getInteractionColor: () => {
          throw new Error('engine failure');
        },
      }));
      const policy = require('./interactionPolicy') as typeof import('./interactionPolicy');

      expect(() => policy.deriveInteractionColor('#ebebeb', 'surfaceNeutralFarther', 'hover', 'standard', appearance('light'))).toThrow(
        'engine failure',
      );
    });
  });
});

describe('resolveFlexColor', () => {
  it('derives omitted interactive states from rest and keeps explicit states', () => {
    const color = resolveFlexColor('surfaceNeutralFarther', normalizeFlexColor({ rest: '#ffffff', hover: '#123456' }), appearance('light'));

    expect(color.rest).toBe('#ffffff');
    expect(color.hover).toBe('#123456');
    expect(color.pressed).toBe(deriveInteractionColor('#ffffff', 'surfaceNeutralFarther', 'pressed', 'standard', appearance('light')));
    expect(color.pressed).not.toBe('#ffffff');
  });

  it('uses the description type as the direction', () => {
    const rest = x3InteractionConformance.backgroundBrandHeavy[modeIndexes.light.rest];
    const inverted = resolveFlexColor('backgroundBrandHeavy', normalizeFlexColor(rest, 'inverted'), appearance('light'));
    const standard = resolveFlexColor('backgroundBrandHeavy', normalizeFlexColor(rest), appearance('light'));

    expect(inverted.hover).toBe(deriveInteractionColor(rest, 'backgroundBrandHeavy', 'hover', 'inverted', appearance('light')));
    expect(standard.hover).toBe(deriveInteractionColor(rest, 'backgroundBrandHeavy', 'hover', 'standard', appearance('light')));
    expect(standard.hover).not.toBe(inverted.hover);
  });

  it('selects tuple entries for the appearance scheme', () => {
    const description = normalizeFlexColor({ rest: ['#ffffff', '#000000'], hover: ['#eeeeee', '#111111'] });

    expect(resolveFlexColor('surfaceNeutralFarther', description, appearance('light'))).toMatchObject({
      rest: '#ffffff',
      hover: '#eeeeee',
    });
    expect(resolveFlexColor('surfaceNeutralFarther', description, appearance('dark'))).toMatchObject({ rest: '#000000', hover: '#111111' });
  });

  it('resolves omitted states to rest in high contrast and for non-interactive tokens', () => {
    const highContrast = resolveFlexColor('surfaceNeutralFarther', normalizeFlexColor('#ffffff'), {
      ...appearance('dark'),
      contrast: 'highContrast',
    });
    const nonInteractive = resolveFlexColor('fixedBlack', normalizeFlexColor('#000000'), appearance('light'));

    expect([highContrast.hover, highContrast.pressed]).toEqual(['#ffffff', '#ffffff']);
    expect([nonInteractive.hover, nonInteractive.pressed]).toEqual(['#000000', '#000000']);
  });

  it('keeps an unmappable native rest value by identity', () => {
    const rest = PlatformColor('controlAccentColor');
    const color = resolveFlexColor('backgroundBrandHeavy', normalizeFlexColor(rest, 'inverted'), appearance('light'));

    expect(color.rest).toBe(rest);
    expect(color.hover).toBe(rest);
    expect(color.pressed).toBe(rest);
  });

  it('requires explicit states for a fixed derivable color', () => {
    const fixed = normalizeFlexColor({ rest: '#0f6cbd', hover: '#115ea3', type: 'fixed' });
    const complete = normalizeFlexColor({ rest: '#0f6cbd', hover: '#115ea3', pressed: '#0c3b5e', type: 'fixed' });

    expect(() => resolveFlexColor('backgroundBrandHeavy', fixed, appearance('light'))).toThrow(
      'type "fixed" and no explicit pressed value',
    );
    expect(() => resolveFlexColor('backgroundBrandHeavy', fixed, { ...appearance('light'), contrast: 'highContrast' })).toThrow(
      'type "fixed"',
    );
    expect(resolveFlexColor('backgroundBrandHeavy', complete, appearance('light'))).toEqual({
      rest: '#0f6cbd',
      hover: '#115ea3',
      pressed: '#0c3b5e',
    });
  });

  it('accepts a fixed native color without explicit states', () => {
    const rest = PlatformColor('controlAccentColor');
    const color = resolveFlexColor('backgroundBrandHeavy', normalizeFlexColor(rest, 'fixed'), appearance('light'));

    expect(color.hover).toBe(rest);
  });
});

describe('resolveFlexTokenDescription', () => {
  it('resolves every default color and shares non-color groups', () => {
    const tokens = resolveFlexTokenDescription(defaultFlexTokenDescription, appearance('light'));

    expect(Object.keys(tokens.color)).toEqual(Object.keys(defaultFlexTokenDescription.color));
    expect(tokens.spacing).toBe(defaultFlexTokenDescription.spacing);
    expect(Object.isFrozen(tokens)).toBe(true);
    expect(Object.isFrozen(tokens.color)).toBe(true);
  });

  it('matches the default explicit states', () => {
    const tokens = resolveFlexTokenDescription(defaultFlexTokenDescription, appearance('light'));

    expect(tokens.color).toEqual(defaultFlexTokens.color);
  });
});

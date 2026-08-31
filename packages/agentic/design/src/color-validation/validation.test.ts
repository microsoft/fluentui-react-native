import { PlatformColor } from 'react-native';

import { getInteractionColorOverrides, INTERACTIVE_COLOR_TOKENS } from '../color-lib';
import type { ColorMode, InteractionColorState, InteractionColorVariant } from '../color-lib';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import type { SemanticColorTokenValues } from '../tokens/flex.types';
import { MODE_SURFACE, PAIRINGS, WCAG } from './index';
import { getContrastFailures, getUnresolvableContrastPairs, validateContrastPairs } from './index';
import { x3BebopWarmInteractionConformance, x3InteractionConformance } from './testing/x3InteractionConformance';

function conformanceColors(
  mode: ColorMode,
  conformance: typeof x3InteractionConformance | typeof x3BebopWarmInteractionConformance = x3InteractionConformance,
): SemanticColorTokenValues {
  const restIndex = mode === 'light' ? 0 : 3;
  const { hover: _hover, pressed: _pressed, ...colors } = defaultFlexTokens.color;
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = conformance[token][restIndex];
  }
  return colors;
}

function interactionConformanceColors(
  mode: ColorMode,
  state: InteractionColorState,
  variant: InteractionColorVariant,
): SemanticColorTokenValues {
  const colors = conformanceColors(mode, variant === 'bebopWarm' ? x3BebopWarmInteractionConformance : x3InteractionConformance);
  return {
    ...colors,
    ...getInteractionColorOverrides(colors, mode, state, { variant }).overrides,
  };
}

const expectedPairs = [
  'foregroundNeutralPrimary/surfaceNeutralNearer',
  'foregroundNeutralPrimary/surfaceNeutralNear',
  'foregroundNeutralPrimary/backgroundNeutralSubtle',
  'foregroundNeutralPrimary/backgroundNeutralSoft',
  'foregroundNeutralSecondary/surfaceNeutralNearer',
  'foregroundNeutralSecondary/backgroundNeutralSubtle',
  'foregroundNeutralTertiary/surfaceNeutralNearer',
  'foregroundNeutralTertiary/surfaceNeutralNear',
  'foregroundNeutralOnloud/backgroundNeutralLoud',
  'foregroundNeutralOnloud/backgroundNeutralHeavy',
  'foregroundBrandOnloud/backgroundBrandLoud',
  'foregroundBrandOnloud/backgroundBrandHeavy',
  'foregroundDangerOnloud/backgroundDangerLoud',
  'foregroundWarningOnloud/backgroundWarningLoud',
  'foregroundSuccessOnloud/backgroundSuccessLoud',
  'foregroundBrandPrimary/surfaceNeutralNearer',
  'foregroundBrandPrimary/backgroundNeutralSubtle',
  'foregroundDangerPrimary/surfaceNeutralNearer',
  'foregroundDangerPrimary/backgroundNeutralSubtle',
  'foregroundDangerPrimary/backgroundDangerSubtle',
  'foregroundDangerPrimary/backgroundDangerSoft',
  'foregroundWarningPrimary/surfaceNeutralNearer',
  'foregroundWarningPrimary/backgroundNeutralSubtle',
  'foregroundWarningPrimary/backgroundWarningSubtle',
  'foregroundWarningPrimary/backgroundWarningSoft',
  'foregroundSuccessPrimary/surfaceNeutralNearer',
  'foregroundSuccessPrimary/backgroundNeutralSubtle',
  'foregroundSuccessPrimary/backgroundSuccessSubtle',
  'foregroundSuccessPrimary/backgroundSuccessSoft',
  'strokeNeutralHeavy/backgroundNeutralSoft',
] as const;

describe('color validation constants', () => {
  it('matches the upstream values', () => {
    expect(MODE_SURFACE).toEqual({ light: '#ffffff', dark: '#000000' });
    expect(WCAG).toEqual({
      aaText: 4.5,
      aaLargeText: 3,
      aaaText: 7,
      aaaLargeText: 4.5,
      visibleStroke: 3,
    });
  });

  it('records source names for every pairing token', () => {
    for (const pairing of PAIRINGS) {
      expect(pairing.foreground.upstream).toMatch(/^--gnrc-color-/);
      for (const background of pairing.backgrounds) {
        expect(background.upstream).toMatch(/^--gnrc-color-/);
      }
    }
  });
});

describe.each(['light', 'dark'] as const)('%s contrast validation', (mode) => {
  it('passes every canonical rest pairing', () => {
    const results = validateContrastPairs(conformanceColors(mode), mode);

    expect(results.map((result) => `${result.foreground.token}/${result.background.token}`)).toEqual(expectedPairs);
    expect(getContrastFailures(results)).toEqual([]);
    expect(getUnresolvableContrastPairs(results)).toEqual([]);
  });

  it.each(['default', 'bebopWarm'] as const)('audits %s interaction values', (variant) => {
    for (const state of ['hover', 'pressed'] as const) {
      const failures = getContrastFailures(validateContrastPairs(interactionConformanceColors(mode, state, variant), mode)).map(
        (result) => `${result.foreground.token}/${result.background.token}`,
      );
      const expectedFailures =
        mode === 'dark' && variant === 'bebopWarm' && state === 'pressed'
          ? [
              'foregroundDangerPrimary/surfaceNeutralNearer',
              'foregroundDangerPrimary/backgroundDangerSubtle',
              'foregroundDangerPrimary/backgroundDangerSoft',
              'foregroundWarningPrimary/backgroundWarningSoft',
            ]
          : mode === 'dark' && state === 'pressed'
            ? ['foregroundDangerPrimary/backgroundDangerSoft', 'foregroundWarningPrimary/backgroundWarningSoft']
            : [];

      expect(failures).toEqual(expectedFailures);
    }
  });
});

describe('unresolvable color validation', () => {
  it('identifies native foreground colors', () => {
    const colors = conformanceColors('light');
    colors.foregroundNeutralPrimary = PlatformColor('labelColor');
    const results = getUnresolvableContrastPairs(validateContrastPairs(colors, 'light')).filter(
      (result) => result.foreground.token === 'foregroundNeutralPrimary',
    );

    expect(results).toHaveLength(4);
    expect(results[0].diagnostics).toEqual([
      expect.objectContaining({
        reason: 'non-literal-color',
        role: 'foreground',
        token: 'foregroundNeutralPrimary',
      }),
    ]);
  });

  it('identifies native background colors', () => {
    const colors = conformanceColors('dark');
    colors.backgroundSuccessSoft = PlatformColor('windowBackgroundColor');
    const result = getUnresolvableContrastPairs(validateContrastPairs(colors, 'dark')).find(
      (pair) => pair.background.token === 'backgroundSuccessSoft',
    );

    expect(result).toMatchObject({
      status: 'unresolvable',
      ratio: null,
      diagnostics: [
        {
          reason: 'non-literal-color',
          role: 'background',
          token: 'backgroundSuccessSoft',
        },
      ],
    });
  });
});

import { PlatformColor } from 'react-native';

import type { ColorMode, InteractionColorState } from '../../color-lib/types';
import { resolveFlexTokenDescription } from '../../flex/colors/interactionPolicy';
import { defaultFlexTokens, getDefaultFlexTokenDescription } from '../../flex/defaults/defaultTokens';
import type { SemanticColorTokenValues } from '../../flex/tokens.types';
import type { ColorTone } from '../../types/appearance.types';
import { getContrastFailures, getUnresolvableContrastPairs, MODE_SURFACE, PAIRINGS, validateContrastPairs, WCAG } from '../index';
import { restColorValues, stateColorValues } from '../fixtures/interactionColors';

// The shipping defaults for one appearance; x3Defaults.test.ts proves they match the pinned design source.
function defaultColors(
  mode: ColorMode,
  colorTone: ColorTone = 'cool',
  state: 'rest' | InteractionColorState = 'rest',
): SemanticColorTokenValues {
  const tokens = resolveFlexTokenDescription(getDefaultFlexTokenDescription(colorTone), {
    colorScheme: mode,
    contrast: 'standard',
    interfaceLevel: 'base',
    colorTone,
  });
  return stateColorValues(tokens.color, state);
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
  it.each(['cool', 'warm'] as const)('passes every canonical %s rest pairing', (colorTone) => {
    const results = validateContrastPairs(defaultColors(mode, colorTone), mode);

    expect(results.map((result) => `${result.foreground.token}/${result.background.token}`)).toEqual(expectedPairs);
    expect(getContrastFailures(results)).toEqual([]);
    expect(getUnresolvableContrastPairs(results)).toEqual([]);
  });

  // Audit outcomes for the shipping defaults, kept visible rather than corrected away from the design source.
  it.each(['cool', 'warm'] as const)('audits %s interaction values', (colorTone) => {
    for (const state of ['hover', 'pressed'] as const) {
      const failures = getContrastFailures(validateContrastPairs(defaultColors(mode, colorTone, state), mode)).map(
        (result) => `${result.foreground.token}/${result.background.token}`,
      );
      const expectedFailures =
        mode === 'dark' && colorTone === 'warm' && state === 'pressed'
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

describe('resolved color validation', () => {
  it('audits resolved Flex colors at rest', () => {
    expect(validateContrastPairs(defaultFlexTokens.color, 'light')).toEqual(
      validateContrastPairs(restColorValues(defaultFlexTokens.color), 'light'),
    );
  });
});

describe('unresolvable color validation', () => {
  it('identifies native foreground colors', () => {
    const colors = defaultColors('light');
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
    const colors = defaultColors('dark');
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

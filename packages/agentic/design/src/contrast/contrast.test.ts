import { PlatformColor } from 'react-native';

import { x3InteractionConformance } from '../color/x3InteractionConformance.test.fixture';
import { deriveInteractionColorOverrides, INTERACTIVE_COLOR_TOKENS } from '../runtime-colors';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import type { SemanticColorTokenValues } from '../tokens/flex.types';
import { composite, contrastRatio, MODE_SURFACE, PAIRINGS, resolvedPairs, WCAG } from './index';

function conformanceColors(mode: 'light' | 'dark'): SemanticColorTokenValues {
  const restIndex = mode === 'light' ? 0 : 3;
  const { hover: _hover, pressed: _pressed, ...colors } = defaultFlexTokens.color;
  for (const token of INTERACTIVE_COLOR_TOKENS) {
    colors[token] = x3InteractionConformance[token][restIndex];
  }
  return colors;
}

function interactionConformanceColors(mode: 'light' | 'dark', state: 'hover' | 'pressed'): SemanticColorTokenValues {
  const colors = conformanceColors(mode);
  return {
    ...colors,
    ...deriveInteractionColorOverrides(colors, mode, state).overrides,
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

describe('contrast primitives', () => {
  it('matches the upstream constants', () => {
    expect(MODE_SURFACE).toEqual({ light: '#ffffff', dark: '#000000' });
    expect(WCAG).toEqual({
      aaText: 4.5,
      aaLargeText: 3,
      aaaText: 7,
      aaaLargeText: 4.5,
      visibleStroke: 3,
    });
  });

  it('composites alpha-channel literals over an opaque surface', () => {
    expect(composite('#0000000d', '#ffffff')).toBe('#f2f2f2');
    expect(composite('#ffffff14', '#000000')).toBe('#141414');
    expect(composite('rgba(255 0 0 / 50%)', '#000000')).toBe('#800000');
  });

  it('computes WCAG contrast after compositing', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
    expect(contrastRatio('#00000080', '#ffffff')).toBeCloseTo(4, 2);
  });

  it('rejects unsupported direct inputs', () => {
    expect(() => composite('red', '#ffffff')).toThrow('Unsupported color literal');
    expect(() => composite('#00000080', '#ffffff80')).toThrow('background color must be opaque');
  });
});

describe.each(['light', 'dark'] as const)('%s contrast conformance', (mode) => {
  it('passes every canonical x3 pairing', () => {
    const results = resolvedPairs(conformanceColors(mode), mode);

    expect(results.map((result) => `${result.foreground.token}/${result.background.token}`)).toEqual(expectedPairs);
    expect(results.filter((result) => result.status !== 'pass')).toEqual([]);
  });

  it.each(['hover', 'pressed'] as const)('audits %s interaction values', (state) => {
    const failures = resolvedPairs(interactionConformanceColors(mode, state), mode)
      .filter((result) => result.status === 'fail')
      .map((result) => `${result.foreground.token}/${result.background.token}`);
    const expectedFailures =
      mode === 'dark' && state === 'pressed'
        ? ['foregroundDangerPrimary/backgroundDangerSoft', 'foregroundWarningPrimary/backgroundWarningSoft']
        : [];

    expect(failures).toEqual(expectedFailures);
  });
});

describe('contrast diagnostics', () => {
  it('records the upstream name for every FURN pairing token', () => {
    for (const pairing of PAIRINGS) {
      expect(pairing.foreground.upstream).toMatch(/^--gnrc-color-/);
      for (const background of pairing.backgrounds) {
        expect(background.upstream).toMatch(/^--gnrc-color-/);
      }
    }
  });

  it('returns unresolvable results for native foreground colors', () => {
    const colors = conformanceColors('light');
    colors.foregroundNeutralPrimary = PlatformColor('labelColor');
    const results = resolvedPairs(colors, 'light').filter((result) => result.foreground.token === 'foregroundNeutralPrimary');

    expect(results).toHaveLength(4);
    expect(results.every((result) => result.status === 'unresolvable' && result.ratio === null)).toBe(true);
    expect(results[0].diagnostics).toEqual([
      expect.objectContaining({
        reason: 'non-literal-color',
        role: 'foreground',
        token: 'foregroundNeutralPrimary',
      }),
    ]);
  });

  it('returns unresolvable results for native background colors', () => {
    const colors = conformanceColors('dark');
    colors.backgroundSuccessSoft = PlatformColor('windowBackgroundColor');
    const result = resolvedPairs(colors, 'dark').find((pair) => pair.background.token === 'backgroundSuccessSoft');

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

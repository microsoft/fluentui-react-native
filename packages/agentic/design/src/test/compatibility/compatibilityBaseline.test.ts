import { PlatformColor } from 'react-native';

import { getDefaultLegacyTheme } from '../../fluent/compat/defaultLegacyTheme';
import { themeFromFlexTokens } from '../../fluent/compat/themeFromFlexTokens';
import type { ResolvedThemeAppearance } from '../../types/appearance.types';
import type { Theme } from '../../fluent/types/Theme.types';
import { mockTheme } from '../fixtures/mockTheme';
import { defaultFlexTokens } from '../../flex/defaults/defaultTokens';
import { flexTokensFromTheme } from '../../flex/adapters/flexTokensFromTheme';
import { flexTokenFingerprints, themeFingerprints } from './fingerprint';

const appearances: [string, ResolvedThemeAppearance][] = [
  ['light', { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' }],
  ['dark', { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' }],
  ['darkElevated', { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' }],
  ['highContrast', { colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'base' }],
];

/**
 * Legacy Fluent consumers must observe identical values through every Flex
 * refactoring phase. The forward-adapter baseline compares the values a
 * consumer reads for each color state, so a representation change that keeps
 * those values passes unchanged.
 */
describe('legacy compatibility baseline', () => {
  it.each(appearances)('keeps the %s default legacy theme', (_name, appearance) => {
    expect(themeFingerprints(getDefaultLegacyTheme(appearance))).toMatchSnapshot();
  });

  it.each(appearances)('keeps Flex values converted from the %s default legacy theme', (_name, appearance) => {
    expect(flexTokenFingerprints(flexTokensFromTheme(getDefaultLegacyTheme(appearance)))).toMatchSnapshot();
  });

  it('keeps Flex values converted from the mock theme', () => {
    expect(flexTokenFingerprints(flexTokensFromTheme(mockTheme))).toMatchSnapshot();
  });

  it('keeps native colors authored in a legacy theme through both adapters', () => {
    const rest = PlatformColor('controlAccentColor');
    const hover = PlatformColor('selectedControlColor');
    const theme: Theme = {
      ...mockTheme,
      colors: { ...mockTheme.colors, brandBackground: rest, brandBackgroundHover: hover },
    };

    const tokens = flexTokensFromTheme(theme);
    expect(tokens.color.backgroundBrandHeavy.rest).toBe(rest);
    expect(tokens.color.backgroundBrandHeavy.hover).toBe(hover);

    const projected = themeFromFlexTokens(tokens, appearances[0][1]);
    expect(projected.colors.brandBackground).toEqual(rest);
    expect(projected.colors.brandBackgroundHover).toEqual(hover);
  });
});

/**
 * Flex-sourced values. These intentionally change when the Flex defaults adopt
 * current x3 sources; they must not change during mechanical or
 * representation-only phases.
 */
describe('Flex default baseline', () => {
  it('keeps the values consumers read from the default Flex tokens', () => {
    expect(flexTokenFingerprints(defaultFlexTokens)).toMatchSnapshot();
  });

  it.each(appearances)('keeps the %s legacy projection of the default Flex tokens', (_name, appearance) => {
    expect(themeFingerprints(themeFromFlexTokens(defaultFlexTokens, appearance))).toMatchSnapshot();
  });
});
